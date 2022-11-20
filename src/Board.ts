import { Piece } from "./Piece";
import { BoardStats } from "./BoardStats";

class InvalidPositionError extends Error {
    constructor() {
        super("This piece cannot be place at given position!");
    }
}

enum BoardLabel {
    Empty,
    Filled,
    CurrentPiece = 9,
    WillBreak
}


interface PlacablePiece {
    piece: Piece;
    isFloating: boolean;
    floatPosition: number[];
}


export class Board {
    public static BOARD_SIZE = 9;
    public static CLEAR_REGIONS: number[][] = [];

    public static BLOCK_SIZE = 25;
    public static GAP_SIZE = 4;
    public static POSITION_OFFSET = [5, 5];

    private _canvas: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;
    private _fixedBoard: BoardLabel[];
    private _visibleBoard: BoardLabel[];

    private _boardStats?: BoardStats;

    private _pieces: (PlacablePiece | undefined)[] = [];

    public constructor(canvas: HTMLCanvasElement, useStats: boolean = false) {
        if (useStats) {
            this._boardStats = new BoardStats(this);
        }

        this._canvas = canvas;
        const context = canvas.getContext("2d");
        if (!context) throw Error("no 2D-context found");
        this._context = context;

        this._fixedBoard = [];
        this._visibleBoard = [];

        for (let i = 0; i < Board.BOARD_SIZE ** 2; i++) {
            this._fixedBoard.push(BoardLabel.Empty);

            // if (i % 4 == 0) this.visibleBoard.push(BoardLabel.Empty);
            // if (i % 4 == 1) this.visibleBoard.push(BoardLabel.Filled);
            // if (i % 4 == 2) this.visibleBoard.push(BoardLabel.CurrentPiece);
            // else this.visibleBoard.push(BoardLabel.WillBreak);
        }

        this.resetVisibleBoard();
    }

    public get canvas() {
        return this._canvas;
    }

    public get pieces() {
        return this._pieces;
    }

    public set pieces(pieces: (PlacablePiece | undefined)[]) {
        this._pieces = pieces;
    }

    public get numberOfFilledBlocks(): number {
        return this._fixedBoard.filter(b => b === BoardLabel.Filled || b === BoardLabel.CurrentPiece).length
    }

    public get numberOfEdges(): number {
        let numberOfEdges = 0;

        for (let i = 0; i < Board.BOARD_SIZE; i++) {
            for (let j = 0; j < Board.BOARD_SIZE - 1; j++) {
                const vIndexA = Board.positionToIndex([i, j]);
                const vIndexB = Board.positionToIndex([i, j + 1]);
                const hIndexA = Board.positionToIndex([j, i]);
                const hIndexB = Board.positionToIndex([j + 1, i]);
                if (this._fixedBoard[vIndexA] + this._fixedBoard[vIndexB] == 1) numberOfEdges++;
                if (this._fixedBoard[hIndexA] + this._fixedBoard[hIndexB] == 1) numberOfEdges++;
            }
        }
        return numberOfEdges
    }

    public clone() {
        const clone = new Board(this._canvas);
        clone._fixedBoard = [...this._fixedBoard];
        return clone;
    }

    public evaluate(): number {
        return this.numberOfFilledBlocks ** 2 + this.numberOfEdges;
    }

    public previewPiece(piece: Piece, piecePosition: number[]) {
        if (!this.isValidPiecePosition(piece, piecePosition)) throw new InvalidPositionError();

        this._visibleBoard = [...this._fixedBoard];
        piece.blocks.forEach(blockPositionOnPiece => {
            const blockPositionOnBoard = [
                blockPositionOnPiece[0] + piecePosition[0],
                blockPositionOnPiece[1] + piecePosition[1]
            ]
            const blockIndexOnBoard = Board.positionToIndex(blockPositionOnBoard);
            this._visibleBoard[blockIndexOnBoard] = BoardLabel.CurrentPiece;
        });

        this.findRegionsThatWillClear();
    }

    public placePiece(piece: Piece, piecePosition: number[]): number {
        if (!this.isValidPiecePosition(piece, piecePosition)) throw new InvalidPositionError();

        let score = 0;

        piece.blocks.forEach(blockPositionOnPiece => {
            const blockPositionOnBoard = [
                blockPositionOnPiece[0] + piecePosition[0],
                blockPositionOnPiece[1] + piecePosition[1]
            ]
            const blockIndexOnBoard = Board.positionToIndex(blockPositionOnBoard);
            this._fixedBoard[blockIndexOnBoard] = BoardLabel.Filled;
            score++;
        });

        score += this.clearRegions();
        this.resetVisibleBoard();

        return score
    }

    public isValidPiecePosition(piece: Piece, piecePosition: number[]): boolean {
        for (let i = 0; i < piece.blocks.length; i++) {
            const blockPositionOnPiece = piece.blocks[i]
            const blockPositionOnBoard = [
                blockPositionOnPiece[0] + piecePosition[0],
                blockPositionOnPiece[1] + piecePosition[1]
            ]
            if (
                blockPositionOnBoard[0] < 0 ||
                blockPositionOnBoard[0] >= Board.BOARD_SIZE ||
                blockPositionOnBoard[1] < 0 ||
                blockPositionOnBoard[1] >= Board.BOARD_SIZE
            ) return false;
            const blockIndexOnBoard = Board.positionToIndex(blockPositionOnBoard);
            if (this._fixedBoard[blockIndexOnBoard] === BoardLabel.Filled) return false;
        }
        return true;
    }

    public resetVisibleBoard() {
        this._visibleBoard = [...this._fixedBoard];
    }

    public render() {

        this._boardStats?.updateStats();

        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        for (let y = 0; y < Board.BOARD_SIZE; y++) {
            for (let x = 0; x < Board.BOARD_SIZE; x++) {
                switch (this._visibleBoard[y * Board.BOARD_SIZE + x]) {
                    case BoardLabel.Empty:
                        this._context.fillStyle = "#ddd";
                        break;
                    case BoardLabel.Filled:
                        this._context.fillStyle = "#00f";
                        break;
                    case BoardLabel.CurrentPiece:
                        this._context.fillStyle = "#0b0";
                        break;
                    case BoardLabel.WillBreak:
                        this._context.fillStyle = "#500";
                        break;
                }

                this._context.fillRect(
                    Board.POSITION_OFFSET[0] + x * Board.BLOCK_SIZE + x * Board.GAP_SIZE,
                    Board.POSITION_OFFSET[1] + y * Board.BLOCK_SIZE + y * Board.GAP_SIZE,
                    Board.BLOCK_SIZE,
                    Board.BLOCK_SIZE
                )
            }
        }

        for (let i = 0; i < this._pieces.length; i++) {
            const piece = this._pieces[i];
            if (piece === undefined) continue;
            let piecePosition = piece.floatPosition;
            if (!piece.isFloating) {
                piecePosition = [
                    Board.POSITION_OFFSET[0] + i * 5 * (Board.BLOCK_SIZE + Board.GAP_SIZE),
                    Board.POSITION_OFFSET[1] + (Board.BOARD_SIZE + 1) * (Board.BLOCK_SIZE + Board.GAP_SIZE)
                ]
            }
            for (const block of piece.piece.blocks) {
                const blockPosition = [
                    piecePosition[0] + block[0] * (Board.BLOCK_SIZE + Board.GAP_SIZE),
                    piecePosition[1] + block[1] * (Board.BLOCK_SIZE + Board.GAP_SIZE)
                ]

                this._context.fillStyle = "#00f";
                this._context.fillRect(
                    blockPosition[0],
                    blockPosition[1],
                    Board.BLOCK_SIZE,
                    Board.BLOCK_SIZE
                )
            }
        }
    }

    private findRegionsThatWillClear() {
        const regionsToClear: number[][] = [];

        Board.CLEAR_REGIONS.forEach(region => {
            for (let i = 0; i < region.length; i++) {
                if (this._visibleBoard[region[i]] === BoardLabel.Empty) return;
            }
            regionsToClear.push(region);
        });

        for (const region of regionsToClear) {
            for (const block of region) {
                this._visibleBoard[block] = BoardLabel.WillBreak;
            }
        }
    }

    private clearRegions(): number {
        const regionsToClear: number[][] = [];

        Board.CLEAR_REGIONS.forEach(region => {
            for (let i = 0; i < region.length; i++) {
                if (this._fixedBoard[region[i]] === BoardLabel.Empty) return;
            }
            regionsToClear.push(region);
        });

        let clearScore = 0;

        for (const region of regionsToClear) {
            clearScore += 20;
            for (const block of region) {
                this._fixedBoard[block] = BoardLabel.Empty;
            }
        }

        return clearScore;
    }

    private static positionToIndex(position: number[]) {
        if (position.length < 2) throw Error(`Invalid Position: ${position}`);
        return position[0] + position[1] * Board.BOARD_SIZE;
    }
}


for (let i = 0; i < Board.BOARD_SIZE * 2; i++) {
    Board.CLEAR_REGIONS.push([]);
}
for (let i = 0; i < Board.BOARD_SIZE; i++) {
    for (let j = 0; j < Board.BOARD_SIZE; j++) {
        Board.CLEAR_REGIONS[i].push(i + j * Board.BOARD_SIZE);
        Board.CLEAR_REGIONS[i + Board.BOARD_SIZE].push(j + i * Board.BOARD_SIZE);
    }
}
for (const startIndex of [0, 3, 6, 27, 30, 33, 54, 57, 60]) {
    const region = [];
    for (const offset of [0, 1, 2, 9, 10, 11, 18, 19, 20]) {
        region.push(startIndex + offset);
    }
    Board.CLEAR_REGIONS.push(region);
}