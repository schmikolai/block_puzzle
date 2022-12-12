export interface PlacablePiece {
    piece: Piece;
    placable: boolean;
    floatPosition: number[];
}

export class Piece {
    private _blocks: number[][];
    private _dimensions: number[];
    private _numberOfEdges: number;

    public get blocks() {
        return this._blocks;
    }

    public get dimensions() {
        return this._dimensions;
    }

    public get numberOfEdges() {
        return this._numberOfEdges;
    }

    public constructor(blocks: number[][]) {
        this._blocks = blocks;
        Object.freeze(this._blocks);
        this._dimensions = this._blocks.reduce((prev, curr) => [Math.max(prev[0], curr[0]), Math.max(prev[1], curr[1])], [0, 0]);
        this._numberOfEdges = this._blocks.reduce((acc, currentBlock) => {
            let numberOfEdges = acc;
            for (const direction of [[-1, 0], [0, -1], [1, 0], [0, 1]]) {
                const possibleNeighbor = [currentBlock[0] + direction[0], currentBlock[1] + direction[1]];
                if (!this._blocks.some(b => b[0] === possibleNeighbor[0] && b[1] === possibleNeighbor[1])) numberOfEdges++;
            }
            return numberOfEdges;
        }, 0);
    }

    public rotate(amount: number): Piece {
        const rotatedBlocks = this._blocks.map(block => [-block[1], block[0]]);
        const topLeft = rotatedBlocks.reduce((prev, curr) => [Math.min(prev[0], curr[0]), Math.min(prev[1], curr[1])], [5, 5]);
        const translatedBlocks = rotatedBlocks.map(block => [block[0] - topLeft[0], block[1] - topLeft[1]]);
        if (amount === 1) return new Piece(translatedBlocks);
        else return new Piece(translatedBlocks).rotate(amount - 1);
    }

    public mirror(axis: "x" | "y"): Piece {
        const mirroredBlocks = this._blocks.map(block => axis === "x" ? [-block[0], block[1]] : [block[0], -block[1]]);
        const topLeft = mirroredBlocks.reduce((prev, curr) => [Math.min(prev[0], curr[0]), Math.min(prev[1], curr[1])], [5, 5]);
        const translatedBlocks = mirroredBlocks.map(block => [block[0] - topLeft[0], block[1] - topLeft[1]]);
        return new Piece(translatedBlocks);
    }
}

const lPiece = new Piece([
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2]
]);

const blob = new Piece([[0, 0]]);

const bigBlob = new Piece([
    [0,0],
    [0,1],
    [1,0],
    [1,1]
]);

const longBoy2 = new Piece([
    [0, 0],
    [0, 1]
])

const longBoy3 = new Piece([
    [0, 0],
    [0, 1],
    [0, 2]
])

const longBoy4 = new Piece([
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3]
])

const longBoy5 = new Piece([
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4]
])

const bridge = new Piece([
    [0, 1],
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1]
])

const z = new Piece([
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1]
])

const lilT = new Piece([
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 0]
])

const bigT = new Piece([
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
    [1, 2]
])

const dia2 = new Piece([
    [0, 0],
    [1, 1]
])

const dia3 = new Piece([
    [0, 0],
    [1, 1],
    [2, 2]
])

export const availablePieces = [
    blob,
    bigBlob,
    lPiece,
    lPiece.rotate(1),
    lPiece.rotate(2),
    lPiece.rotate(3),
    lPiece.mirror("y"),
    lPiece.mirror("y").rotate(1),
    lPiece.mirror("y").rotate(2),
    lPiece.mirror("y").rotate(3),
    longBoy2,
    longBoy2.rotate(1),
    longBoy3,
    longBoy3.rotate(1),
    longBoy4,
    longBoy4.rotate(1),
    longBoy5,
    longBoy5.rotate(1),
    bridge,
    bridge.rotate(1),
    bridge.rotate(2),
    bridge.rotate(3),
    z,
    z.rotate(1),
    z.mirror("x"),
    z.mirror("x").rotate(1),
    lilT,
    lilT.rotate(1),
    lilT.rotate(2),
    lilT.rotate(3),
    bigT,
    bigT.rotate(1),
    bigT.rotate(2),
    bigT.rotate(3),
    dia2,
    dia2.rotate(1),
    dia3,
    dia3.rotate(1)
]