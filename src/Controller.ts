import { Piece } from "./Piece";
import { Board } from "./Board";
import { UI, PlacablePiece } from "./UI";
import { Plot } from "./Plot";
import { Debug } from "./Debug";


interface Turn {
    piece: number;
    position: number[];
}


export interface Controller {
    placePiece: (board: Board, pieces: (Piece | undefined)[]) => Promise<Turn>;
}


export class PlayerController implements Controller {

    private _board?: Board;
    private _activePieceIndex = -1;
    private _currentPieceSelection: (PlacablePiece | undefined)[] = [];
    private _elementOffset: number[] = [];

    private _resolver?: (turn: Turn) => void;

    constructor() {
        UI.pieceCanvases.forEach((pieceCanvas, index) => {
            pieceCanvas.addEventListener("pointerdown", this.pointerDownListener.bind(this, index));
        })
        window.addEventListener("pointermove", this.pointerMoveListener.bind(this));
        window.addEventListener("pointerup", this.pointerUpListener.bind(this));
    }

    placePiece(board: Board, pieces: (Piece | undefined)[]): Promise<Turn> {
        this._board = board;
        this._currentPieceSelection = pieces.map((piece) => {
            if (piece === undefined) return undefined;
            return {
                piece,
                floatPosition: [0, 0]
            }
        });

        return new Promise((resolve) => {
            this._resolver = resolve;
    
        })
    }

    private pointerDownListener(index: number, event: PointerEvent) {
        this._activePieceIndex = index;
        this._elementOffset = [
            event.offsetX,
            event.offsetY
        ]
    }

    private pointerMoveListener(event: PointerEvent) {
        Debug.debugValue("Active element", this._activePieceIndex);
        if (!this._board || this._activePieceIndex < 0) return;

        const activePiece = this._currentPieceSelection[this._activePieceIndex];
        if (!activePiece) return;

        const boardPositionInWindow = UI.positionInWindow;
        Debug.debugValue("Board offset", boardPositionInWindow.toString());
        Debug.debugValue("Piece canvas offset", UI.pieceCanvasOffsets[this._activePieceIndex].toString());
        Debug.debugValue("Event Offset", `${event.offsetX} | ${event.offsetY}`)

        activePiece.floatPosition = [
            event.clientX - this._elementOffset[0] - UI.pieceCanvasOffsets[this._activePieceIndex][0] - boardPositionInWindow[0],
            event.clientY - this._elementOffset[1] - UI.pieceCanvasOffsets[this._activePieceIndex][1] - boardPositionInWindow[1]
        ]

        UI.renderPieces(this._currentPieceSelection);

        try {
            const tileUnderneathPiece = UI.coordinateToTile([
                activePiece.floatPosition[0] + UI.pieceCanvasOffsets[this._activePieceIndex][0],
                activePiece.floatPosition[1] + UI.pieceCanvasOffsets[this._activePieceIndex][1],
            ]);
            this._board.previewPiece(activePiece.piece, tileUnderneathPiece);
        } catch {
            this._board.resetVisibleBoard();
        } finally {
            UI.renderBoard(this._board);
        }
    }

    private pointerUpListener() {
        const activePiece = this._currentPieceSelection[this._activePieceIndex];
        if (!activePiece) return;
        try {
            const tile = UI.coordinateToTile([
                activePiece.floatPosition[0] + UI.pieceCanvasOffsets[this._activePieceIndex][0],
                activePiece.floatPosition[1] + UI.pieceCanvasOffsets[this._activePieceIndex][1]
            ])
        
            this._resolver && this._resolver({
                piece: this._activePieceIndex,
                position: tile
            });
        } finally {
            activePiece.floatPosition = [0,0];
            this._activePieceIndex = -1;
            UI.renderPieces(this._currentPieceSelection);
        }
    }
}

function delay(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


export class OneTurnAI implements Controller {
    async placePiece(board: Board, pieces: (Piece | undefined)[]): Promise<Turn> {
        let bestTurn = {
            piece: -1,
            position: [0, 0],
            evaluation: -1
        }
        await delay(1);

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            if (piece === undefined) continue;

            for (let y = 0; y < Board.BOARD_SIZE; y++) {
                for (let x = 0; x < Board.BOARD_SIZE; x++) {
                    const nextBoard = board.clone();
                    try {
                        nextBoard.placePiece(piece, [x, y]);
                    } catch {
                        continue;
                    }

                    const evaluation = nextBoard.evaluate();
                    if (bestTurn.evaluation === -1 || bestTurn.evaluation > evaluation) {
                        bestTurn = {
                            piece: i,
                            position: [x, y],
                            evaluation,
                        }
                    }
                }
            }
        }

        return bestTurn;
    }
}


interface Move {
    turns: Turn[];
    evaluation: number
}


export class AllPiecesAI implements Controller {
    private static readonly TURN_DELAY = 120;

    private turnQueue: Turn[] = [];
    private numberOfPossibleMoves = 0;
    private _plot: Plot;

    public constructor() {
        UI.enablePieceAnimation(AllPiecesAI.TURN_DELAY);
        this._plot = new Plot();
    }

    async placePiece(board: Board, pieces: (Piece | undefined)[]): Promise<Turn> {

        await delay(10);
        if (this.turnQueue.length === 0) {
            this.numberOfPossibleMoves = 0;
            console.time("Evaluate moves");
            this.turnQueue = (await this.checkMoves(board, pieces, [])).turns;
            console.timeEnd("Evaluate moves");
            console.log(this.numberOfPossibleMoves, "possible moves evaluated.");
            this._plot.logValue(this.numberOfPossibleMoves);
        }

        const nextTurn = this.turnQueue.shift();
        if (!nextTurn) throw Error("Error with turn queue happened");

        UI.renderPieces(pieces.map((piece, index) => {
            if (piece === undefined) return undefined;
            const positionedPiece = {
                piece,
                floatPosition: [0, 0]
            }
            if (index == nextTurn.piece) {
                const desiredPosition = UI.tileToCoordinate(nextTurn.position);
                positionedPiece.floatPosition = [
                    desiredPosition[0] - UI.pieceCanvasOffsets[index][0],
                    desiredPosition[1] - UI.pieceCanvasOffsets[index][1]
                ]
            }
            return positionedPiece;
        }));
        await delay(AllPiecesAI.TURN_DELAY);

        const piece = pieces[nextTurn.piece];
        if (piece) {
            board.previewPiece(piece, nextTurn.position);
            UI.renderBoard(board);
        }
        await delay(AllPiecesAI.TURN_DELAY);

        return nextTurn;
    }

    private async checkMoves(board: Board, pieces: (Piece | undefined)[], turns: Turn[]): Promise<Move> {
        if (pieces.every(p => p === undefined)) {
            return {
                turns,
                evaluation: board.evaluate()
            };
        }

        let bestNextMove: Move = {
            turns,
            evaluation: -1
        }

        const numberOfEdgesOfCurrentBoard = board.numberOfEdges;

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            if (piece === undefined) continue;

            const remainingPieces = [...pieces];
            remainingPieces[i] = undefined;

            for (let y = 0; y < Board.BOARD_SIZE - piece.dimensions[1]; y++) {
                for (let x = 0; x < Board.BOARD_SIZE - piece.dimensions[0]; x++) {
                    try {
                        board.previewPiece(piece, [x, y]);
                    } catch {
                        continue;
                    }
                    const nextBoard = board.clone();
                    nextBoard.placePiece(piece, [x, y]);

                    if (nextBoard.numberOfEdges === (numberOfEdgesOfCurrentBoard + piece.numberOfEdges)) continue;

                    const nextMove = await this.checkMoves(nextBoard, remainingPieces, [...turns, { piece: i, position: [x, y] }]);
                    this.numberOfPossibleMoves++;
                    if (bestNextMove.evaluation === -1 || bestNextMove.evaluation > nextMove.evaluation) {
                        bestNextMove = nextMove;
                    }
                }
            }
        }

        return bestNextMove;
    }
}