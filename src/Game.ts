import { Board } from "./Board";
import { Piece, availablePieces } from "./Piece";
import { Controller } from "./Controller";
import { UI } from "./UI";

console.log(availablePieces);

export class Game {
    public static readonly NUMBER_OF_PIECES = 3;

    private board: Board;
    private controller: Controller;

    private _score: number;
    private _piecesToPlace: (Piece | undefined)[];

    constructor(controller: Controller) {
        this.board = new Board();
        this.controller = controller;
        this._score = 0;
        this._piecesToPlace = [];
    }

    public async start() {
        this._score = 0;
        while (true) {
            // Generate next set of pieces
            this._piecesToPlace = this.providePieces();
            this.fullRender();

            // Let the controller place all pieces
            while (this._piecesToPlace.filter(p => p !== undefined).length) {
                const turn = await this.controller.placePiece(this.board, this._piecesToPlace);
                const pieceToPlace = this._piecesToPlace[turn.piece];
                if (pieceToPlace === undefined) throw Error("Piece has already been placed!");
                try {
                    this._score += this.board.placePiece(pieceToPlace, turn.position);
                } catch {
                    continue;
                }
                this._piecesToPlace[turn.piece] = undefined;
                this.fullRender();
                UI.renderScore(this._score);
            }
        }
    }

    private providePieces() {
        // return [...availablePieces];
        const pieces = [];
        for (let i = 0; i < Game.NUMBER_OF_PIECES; i++)
            // pieces.push(availablePieces.shift());
            pieces.push(availablePieces[Math.floor(Math.random() * availablePieces.length)]);
        return pieces;
    }

    private fullRender() {
        const placablePieces = this._piecesToPlace.map(p => p ? ({
            piece: p,
            floatPosition: [0, 0]
        }) : undefined)
        UI.renderBoard(this.board);
        UI.renderPieces(placablePieces);
    }
}