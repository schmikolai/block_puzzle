import { Piece } from "./Piece";
import { Board } from "./Board";


interface Turn {
    piece: number;
    position: number[];
}


export interface Controller {
    placePiece: (board: Board, pieces: (Piece | undefined)[]) => Promise<Turn>;
}


export class PlayerController implements Controller {
    placePiece(board: Board, pieces: (Piece | undefined)[]): Promise<Turn> {
        return new Promise((resolve) => {
            let pieceIndex = -1;

            const keyDownListener = (event: any) => {
                switch (event.key) {
                    case "1":
                        pieceIndex = 0;
                        break;
                    case "2":
                        pieceIndex = 1;
                        break;
                    case "3":
                        pieceIndex = 2;
                        break;
                }
            }

            const pointerMoveListener = (event: any) => {
                const posX = Math.floor((event.offsetX - Board.POSITION_OFFSET[0]) / (Board.BLOCK_SIZE + Board.GAP_SIZE));
                const posY = Math.floor((event.offsetY - Board.POSITION_OFFSET[1]) / (Board.BLOCK_SIZE + Board.GAP_SIZE));

                if (pieceIndex >= 0 && pieces[pieceIndex] !== undefined) {
                    try {
                        const piece = pieces[pieceIndex];
                        if (piece === undefined) throw Error("Invalid piece");
                        board.previewPiece(piece, [posX, posY]);
                    } catch (error) {
                        board.resetVisibleBoard();
                    } finally {
                        board.render();
                    }
                }
            }

            const pointerUpListener = (event: any) => {
                const posX = Math.floor((event.offsetX - Board.POSITION_OFFSET[0]) / (Board.BLOCK_SIZE + Board.GAP_SIZE));
                const posY = Math.floor((event.offsetY - Board.POSITION_OFFSET[1]) / (Board.BLOCK_SIZE + Board.GAP_SIZE));

                if (pieceIndex >= 0 && pieces[pieceIndex] !== undefined) {
                    window.removeEventListener("keydown", keyDownListener);
                    board.canvas.removeEventListener("pointermove", pointerMoveListener);
                    board.canvas.removeEventListener("pointerup", pointerUpListener);
                    resolve({
                        piece: pieceIndex,
                        position: [posX, posY]
                    });
                }
            }

            window.addEventListener("keydown", keyDownListener);

            board.canvas.addEventListener("pointermove", pointerMoveListener);

            board.canvas.addEventListener("pointerup", pointerUpListener)
        })
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
    private static TURN_DELAY = 150;

    private turnQueue: Turn[] = [];
    private numberOfPossibleMoves = 0;

    async placePiece(board: Board, pieces: (Piece | undefined)[]): Promise<Turn> {

        await delay(AllPiecesAI.TURN_DELAY);
        if (this.turnQueue.length === 0) {
            this.numberOfPossibleMoves = 0;
            console.time("Evaluate moves");
            this.turnQueue = (await this.checkMoves(board, pieces, [])).turns;
            console.timeEnd("Evaluate moves");
            console.log(this.numberOfPossibleMoves, "possible moves evaluated.");
            console.log(this.turnQueue);
        }

        const nextTurn = this.turnQueue.shift();
        if (!nextTurn) throw Error("Error with turn queue happened");

        const piece = pieces[nextTurn.piece];
        if (piece) {
            board.previewPiece(piece, nextTurn.position);
            board.render();
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
                    // board.render()
                    // await delay(15)
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

    // private isSurroundedByEmpty
}