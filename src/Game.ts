import { Board } from "./Board";
import { availablePieces, PlacablePiece } from "./Piece";
import { Controller } from "./Controller";
import { UI } from "./UI";

console.log(availablePieces);

class NoMorePossibleMovesError extends Error {}

export class Game {
    public static readonly NUMBER_OF_PIECES = 3;

    private board: Board;
    private controller: Controller;

    private _score: number;
    private _piecesToPlace: (PlacablePiece | undefined)[];

    constructor(controller: Controller) {
        this.board = new Board();
        this.controller = controller;
        this._score = 0;
        this._piecesToPlace = [];
    }

    public async start() {
        this._score = 0;
        try {
            await this.gameLoop();
        } catch (error) {
            if (error instanceof NoMorePossibleMovesError) {
                console.log("Game over");
                return;
            }
            throw error;
        }
    }

    private async gameLoop() {
        while (true) {
            // Generate next set of pieces.
            this._piecesToPlace = this.providePieces();
            this.fullRender();

            // Let the controller place all pieces.
            while (this._piecesToPlace.filter(p => p !== undefined).length) {
                for (const placablePiece of this._piecesToPlace) {
                    if (placablePiece) {
                        placablePiece.placable = this.board.canHoldPiece(placablePiece.piece);
                    }
                }
                this.fullRender();

                // End game when no more moves are possible.
                const piecesThatCanBePlaced = this._piecesToPlace.filter(placablePiece => placablePiece && placablePiece.placable);
                if (!piecesThatCanBePlaced.length) throw new NoMorePossibleMovesError();

                // Let the controller place a piece on the board.
                const turn = await this.controller.placePiece(this.board, this._piecesToPlace);
                const pieceToPlace = this._piecesToPlace[turn.piece];
                if (pieceToPlace === undefined) throw Error("Piece has already been placed!");
                try {
                    this._score += this.board.placePiece(pieceToPlace.piece, turn.position);
                } catch {
                    continue;
                }
                this._piecesToPlace[turn.piece] = undefined;
                UI.renderScore(this._score);
            }
        }
    }

    private providePieces()  {
        const pieces: PlacablePiece[] = [];
        for (let i = 0; i < Game.NUMBER_OF_PIECES; i++) {
            pieces.push({
                piece: availablePieces[Math.floor(Math.random() * availablePieces.length)],
                placable: true,
                floatPosition: [0,0]
            });
        }
        return pieces;
    }

    private fullRender() {
        UI.renderBoard(this.board);
        UI.renderPieces(this._piecesToPlace);
    }
}