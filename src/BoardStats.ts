import { Board } from "./Board";

export class BoardStats {
    private edgeCountLabel: HTMLElement;
    private filledBlocksCountLabel: HTMLElement;

    private board: Board;
    
    constructor(board: Board) {
        this.board = board;

        const container = document.createElement("div");

        this.edgeCountLabel = document.createElement("p");
        this.filledBlocksCountLabel = document.createElement("p");

        container.append(this.edgeCountLabel, this.filledBlocksCountLabel);

        document.body.append(container)
    }

    public updateStats() {
        this.edgeCountLabel.innerText = this.board.numberOfEdges.toFixed();
        this.filledBlocksCountLabel.innerText = this.board.numberOfFilledBlocks.toFixed();
    }
}