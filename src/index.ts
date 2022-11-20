import { Board } from "./Board";
import { Game } from "./Game";
import { PlayerController, OneTurnAI, AllPiecesAI } from "./Controller";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("game") as HTMLCanvasElement;
    const scoreLabel = document.createElement("span");
    document.body.append(scoreLabel);
    
    const board = new Board(canvas, true);

    const game = new Game(board, new AllPiecesAI, scoreLabel);

    game.start();
})

