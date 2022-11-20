import { Board } from "./Board";
import { Piece, availablePieces } from "./Piece";
import { Controller } from "./Controller";

console.log(availablePieces);

export class Game {
    private board: Board;
    private controller: Controller;
    private scoreLabel: HTMLElement;

    private _score: number;

    constructor(board: Board, controller: Controller, scoreLabel: HTMLElement) {
        this.board = board;
        this.controller = controller;
        this.scoreLabel = scoreLabel;
        this._score = 0;
    }

    public async start() {
        this._score = 0;
        while (true) {
            const piecesToPlace: (Piece | undefined)[] = this.providePieces();
            this.board.pieces = piecesToPlace.map(p => p ? ({
                piece: p,
                isFloating: false,
                floatPosition: [0, 0]
            }) : undefined)
            this.board.render();
            while (piecesToPlace.filter(p => p !== undefined).length) {
                const turn = await this.controller.placePiece(this.board, piecesToPlace);
                const pieceToPlace = piecesToPlace[turn.piece];
                if (pieceToPlace === undefined) throw Error("Piece has already been placed!");
                try {
                    this._score += this.board.placePiece(pieceToPlace, turn.position);
                } catch {
                    continue;
                }
                piecesToPlace[turn.piece] = undefined;
                this.board.pieces[turn.piece] = undefined;
                this.board.render();
                this.scoreLabel.innerHTML = this._score.toLocaleString()
            }
        }
    }

    private providePieces(numberOfPieces = 3) {
        // return [...availablePieces];
        const pieces = [];
        for (let i = 0; i < numberOfPieces; i++)
            // pieces.push(availablePieces.shift());
            pieces.push(availablePieces[Math.floor(Math.random() * availablePieces.length)]);
        return pieces;
    }
}