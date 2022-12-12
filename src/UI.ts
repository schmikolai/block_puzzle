import { Board, BoardLabel } from "./Board";
import { Piece } from "./Piece";


export class PlacablePiece {
    public piece!: Piece;
    public floatPosition!: number[];
}

export class UI {
    public static readonly BLOCK_SIZE = 40;
    public static readonly GAP_SIZE = 6;
    public static readonly POSITION_OFFSET = [15, 15];

    public static readonly COLORS = {
        filled: "#0045ff",
        empty: "#aaa",
        willBreak: "#444",
        piecePreview: "#00b000",
        piece: "#7777ffad"
    }

    private static _container: HTMLElement;
    private static _boardCanvas: HTMLCanvasElement;
    private static _boardContext: CanvasRenderingContext2D;
    private static _pieceCanvases: HTMLCanvasElement[];
    private static _pieceCanvasOffsets: number[][];
    private static _scoreLabel: HTMLSpanElement;

    private static _currentlyDrawnPieces: (PlacablePiece | undefined)[];


    public static get boardCanvas() {
        return this._boardCanvas;
    }

    public static get pieceCanvases() {
        return this._pieceCanvases;
    }

    public static get pieceCanvasOffsets() {
        return this._pieceCanvasOffsets;
    }

    public static get positionInWindow() {
        return [
            this._container.clientLeft + UI.POSITION_OFFSET[0],
            this._container.clientTop + UI.POSITION_OFFSET[1]
        ]
    }

    public static init(container: HTMLElement, numberOfPieces: number) {
        // Create board canvas.
        UI._boardCanvas = document.createElement("canvas");
        UI._boardCanvas.id = "board_canvas";
        UI._boardCanvas.width = UI.BLOCK_SIZE * Board.BOARD_SIZE + UI.GAP_SIZE * (Board.BOARD_SIZE - 1) + UI.POSITION_OFFSET[0] * 2;
        UI._boardCanvas.height = UI.BLOCK_SIZE * Board.BOARD_SIZE + UI.GAP_SIZE * (Board.BOARD_SIZE - 1) + UI.POSITION_OFFSET[1] * 2;
        container.append(UI._boardCanvas);
        const context = UI._boardCanvas.getContext("2d");
        if (!context) throw Error("no 2D-context found");
        this._boardContext = context;

        // Create score Label.
        UI._scoreLabel = document.createElement("span");
        UI._scoreLabel.style.left = `${UI._boardCanvas.width}px`;
        UI._scoreLabel.id = "score";
        container.append(UI._scoreLabel);

        // Create piece canvases.
        this._pieceCanvases = [];

        UI._pieceCanvasOffsets = [];

        for (let i = 0; i < numberOfPieces; i++) {
            const createdCanvas = document.createElement("canvas");
            const pieceSizeInPixel = UI.BLOCK_SIZE * 5 + UI.GAP_SIZE * 4;
            createdCanvas.width = pieceSizeInPixel;
            createdCanvas.height = pieceSizeInPixel;
            createdCanvas.classList.add("piece_canvas");

            const offset = [
                pieceSizeInPixel * i + UI.POSITION_OFFSET[0] * (i + 1),
                UI.BLOCK_SIZE * (Board.BOARD_SIZE + 1) + UI.GAP_SIZE * Board.BOARD_SIZE + UI.POSITION_OFFSET[1]
            ];
            UI._pieceCanvasOffsets.push(offset);
            createdCanvas.style.left = `${offset[0]}px`;
            createdCanvas.style.top = `${offset[1]}px`;

            this._pieceCanvases.push(createdCanvas);
            container.append(createdCanvas);
        }

        // Set height of container DIV
        this._container = container;
        container.style.height = `${container.scrollHeight}px`;
        container.style.width = `${container.scrollWidth}px`;
    }

    public static renderBoard(board: Board) {
        this._boardContext.clearRect(0, 0, this._boardCanvas.width, this._boardCanvas.height);

        for (let y = 0; y < Board.BOARD_SIZE; y++) {
            for (let x = 0; x < Board.BOARD_SIZE; x++) {
                switch (board.visibleBoard[y * Board.BOARD_SIZE + x]) {
                    case BoardLabel.Empty:
                        this._boardContext.fillStyle = UI.COLORS.empty;
                        break;
                    case BoardLabel.Filled:
                        this._boardContext.fillStyle = UI.COLORS.filled;
                        break;
                    case BoardLabel.CurrentPiece:
                        this._boardContext.fillStyle = UI.COLORS.piecePreview;
                        break;
                    case BoardLabel.WillBreak:
                        this._boardContext.fillStyle = UI.COLORS.willBreak;
                        break;
                }

                this._boardContext.fillRect(
                    UI.POSITION_OFFSET[0] + x * UI.BLOCK_SIZE + x * UI.GAP_SIZE,
                    UI.POSITION_OFFSET[1] + y * UI.BLOCK_SIZE + y * UI.GAP_SIZE,
                    UI.BLOCK_SIZE,
                    UI.BLOCK_SIZE
                )
            }
        }
    }

    public static renderPieces(pieces: (PlacablePiece | undefined)[]) {
        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];
            let previousPiece = undefined;
            if (UI._currentlyDrawnPieces) {
                previousPiece = UI._currentlyDrawnPieces[i];
            }

            const pieceCanvas = UI._pieceCanvases[i];
            const pieceCanvasContext = pieceCanvas.getContext("2d");
            if (!pieceCanvasContext) continue;

            // Update only pieces that changed
            // if (piece == previousPiece) continue;

            // Clear empty piece slots
            if (piece === undefined) {
                pieceCanvasContext?.clearRect(0, 0, pieceCanvas.width, pieceCanvas.height);
                pieceCanvas.style.visibility = "hidden";
                continue;
            }
            
            pieceCanvas.style.visibility = "visible";

            // Position piece
            pieceCanvas.style.transform = `translate(${piece.floatPosition[0]}px, ${piece.floatPosition[1]}px)`;

            // Don't redraw canvas if blocks did not change
            if (piece.piece.blocks.toString() == previousPiece?.piece.blocks.toString()) continue;

            // Draw blocks of piece to canvas
            for (const block of piece.piece.blocks) {
                const blockPosition = [
                    block[0] * (UI.BLOCK_SIZE + UI.GAP_SIZE),
                    block[1] * (UI.BLOCK_SIZE + UI.GAP_SIZE)
                ]

                pieceCanvasContext.fillStyle = UI.COLORS.piece;
                pieceCanvasContext.fillRect(
                    blockPosition[0],
                    blockPosition[1],
                    UI.BLOCK_SIZE,
                    UI.BLOCK_SIZE
                )
            }
        }

        UI._currentlyDrawnPieces = pieces;
    }

    public static renderScore(score: number) {
        UI._scoreLabel.innerText = score.toLocaleString();
    }

    public static enablePieceAnimation(animationDuration: number) {
        for (const pieceCanvas of UI._pieceCanvases) {
            pieceCanvas.classList.add("auto-animate");
            pieceCanvas.style.transitionDuration = `${animationDuration}ms`;
        }
    }

    public static disablePieceAnimation() {
        for (const pieceCanvas of UI._pieceCanvases) {
            pieceCanvas.classList.remove("auto-animate");
        }
    }

    public static tileToCoordinate(tile: number[]) {
        const x = tile[0];
        const y = tile[1];

        return [
            UI.POSITION_OFFSET[0] + x * (UI.BLOCK_SIZE + UI.GAP_SIZE),
            UI.POSITION_OFFSET[1] + y * (UI.BLOCK_SIZE + UI.GAP_SIZE)
        ]
    }

    public static coordinateToTile(position: number[]) {
        const tileX = Math.round((position[0] - UI.POSITION_OFFSET[0]) / (UI.BLOCK_SIZE + UI.GAP_SIZE));
        const tileY = Math.round((position[1] - UI.POSITION_OFFSET[1]) / (UI.BLOCK_SIZE + UI.GAP_SIZE));
        if (
            tileX < 0 || tileX >= Board.BOARD_SIZE ||
            tileY < 0 || tileY >= Board.BOARD_SIZE
        ) {
            throw Error("Position outside of board");
        }
        return [tileX, tileY];
    }
}