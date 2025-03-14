import { Game } from "./Game";
import { PlayerController, AllPiecesAI } from "./Controller";
import { UI } from "./UI";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("game_container") as HTMLElement;

    const debug = new URLSearchParams(window.location.search).get("debug") === "true";

    UI.init(container, Game.NUMBER_OF_PIECES);

    const startScreen = document.getElementById("start_screen");
    const gameOverScreen = document.getElementById("game_over_screen");

    const startGamePlayerButton = document.getElementById("startGamePlayer");
    const startGameAIButton = document.getElementById("startGameAI");
    const gotoMenuButton = document.getElementById("gotoMenu");

    if (!startGamePlayerButton || !startGameAIButton || !gotoMenuButton || !startScreen || !gameOverScreen) return;

    const showGameOver = () => {
        gameOverScreen.style.visibility = "visible";
    }

    startGamePlayerButton.onclick = () => {
        container.classList.add("player");
        container.classList.remove("ai");
        startScreen.style.visibility = "hidden";
        const game = new Game(new PlayerController(debug));
        game.onGameOver = showGameOver;
        game.start();
        // showGameOver();
    }

    startGameAIButton.onclick = () => {
        container.classList.add("ai");
        container.classList.remove("player");
        startScreen.style.visibility = "hidden";
        const game = new Game(new AllPiecesAI(debug));
        game.onGameOver = showGameOver;
        game.start();
    }

    gotoMenuButton.onclick = () => {
        startScreen.style.visibility = "visible";
        gameOverScreen.style.visibility = "hidden";
    }
})

