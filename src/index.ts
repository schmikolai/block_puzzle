import { Game } from "./Game";
import { PlayerController, OneTurnAI, AllPiecesAI } from "./Controller";
import { UI } from "./UI";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("game_container") as HTMLCanvasElement;

    UI.init(container, Game.NUMBER_OF_PIECES);
    
    const game = new Game(new AllPiecesAI);

    game.start();
})

