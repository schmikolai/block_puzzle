/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Board.ts":
/*!**********************!*\
  !*** ./src/Board.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Board = void 0;\r\nclass InvalidPositionError extends Error {\r\n    constructor() {\r\n        super(\"This piece cannot be place at given position!\");\r\n    }\r\n}\r\nvar BoardLabel;\r\n(function (BoardLabel) {\r\n    BoardLabel[BoardLabel[\"Empty\"] = 0] = \"Empty\";\r\n    BoardLabel[BoardLabel[\"Filled\"] = 1] = \"Filled\";\r\n    BoardLabel[BoardLabel[\"CurrentPiece\"] = 9] = \"CurrentPiece\";\r\n    BoardLabel[BoardLabel[\"WillBreak\"] = 10] = \"WillBreak\";\r\n})(BoardLabel || (BoardLabel = {}));\r\nconst defaultBoardDrawOptions = {\r\n    position: { x: 5, y: 5 },\r\n    blockSize: 40,\r\n    gapSize: 4\r\n};\r\nclass Board {\r\n    constructor(canvas) {\r\n        this._canvas = canvas;\r\n        const context = canvas.getContext(\"2d\");\r\n        if (!context)\r\n            throw Error(\"no 2D-context found\");\r\n        this._context = context;\r\n        this._fixedBoard = [];\r\n        this._visibleBoard = [];\r\n        for (let i = 0; i < Board.BOARD_SIZE ** 2; i++) {\r\n            this._fixedBoard.push(BoardLabel.Empty);\r\n            // if (i % 4 == 0) this.visibleBoard.push(BoardLabel.Empty);\r\n            // if (i % 4 == 1) this.visibleBoard.push(BoardLabel.Filled);\r\n            // if (i % 4 == 2) this.visibleBoard.push(BoardLabel.CurrentPiece);\r\n            // else this.visibleBoard.push(BoardLabel.WillBreak);\r\n        }\r\n        this.clearVisibleBoard();\r\n    }\r\n    get canvas() {\r\n        return this._canvas;\r\n    }\r\n    clone() {\r\n        const clone = new Board(this._canvas);\r\n        clone._fixedBoard = [...this._fixedBoard];\r\n        return clone;\r\n    }\r\n    evaluate() {\r\n        const numberOfFilledBlocks = this._fixedBoard.filter(b => b === BoardLabel.Filled || b === BoardLabel.CurrentPiece).length;\r\n        // return numberOfFilledBlocks\r\n        let numberOfEdges = 0;\r\n        for (let i = 0; i < Board.BOARD_SIZE; i++) {\r\n            for (let j = 0; j < Board.BOARD_SIZE - 1; j++) {\r\n                const vIndexA = Board.positionToIndex([i, j]);\r\n                const vIndexB = Board.positionToIndex([i, j + 1]);\r\n                const hIndexA = Board.positionToIndex([j, i]);\r\n                const hIndexB = Board.positionToIndex([j + 1, i]);\r\n                if (this._fixedBoard[vIndexA] + this._fixedBoard[vIndexB] == 1)\r\n                    numberOfEdges++;\r\n                if (this._fixedBoard[hIndexA] + this._fixedBoard[hIndexB] == 1)\r\n                    numberOfEdges++;\r\n            }\r\n        }\r\n        return numberOfFilledBlocks ** 2 + numberOfEdges;\r\n    }\r\n    previewPiece(piece, piecePosition) {\r\n        if (!this.isValidPiecePosition(piece, piecePosition))\r\n            throw new InvalidPositionError();\r\n        this._visibleBoard = [...this._fixedBoard];\r\n        piece.blocks.forEach(blockPositionOnPiece => {\r\n            const blockPositionOnBoard = [\r\n                blockPositionOnPiece[0] + piecePosition[0],\r\n                blockPositionOnPiece[1] + piecePosition[1]\r\n            ];\r\n            const blockIndexOnBoard = Board.positionToIndex(blockPositionOnBoard);\r\n            this._visibleBoard[blockIndexOnBoard] = BoardLabel.CurrentPiece;\r\n        });\r\n    }\r\n    placePiece(piece, piecePosition) {\r\n        if (!this.isValidPiecePosition(piece, piecePosition))\r\n            throw new InvalidPositionError();\r\n        piece.blocks.forEach(blockPositionOnPiece => {\r\n            const blockPositionOnBoard = [\r\n                blockPositionOnPiece[0] + piecePosition[0],\r\n                blockPositionOnPiece[1] + piecePosition[1]\r\n            ];\r\n            const blockIndexOnBoard = Board.positionToIndex(blockPositionOnBoard);\r\n            this._fixedBoard[blockIndexOnBoard] = BoardLabel.Filled;\r\n        });\r\n        this.checkClearRegions();\r\n        this.clearVisibleBoard();\r\n    }\r\n    isValidPiecePosition(piece, piecePosition) {\r\n        for (let i = 0; i < piece.blocks.length; i++) {\r\n            const blockPositionOnPiece = piece.blocks[i];\r\n            const blockPositionOnBoard = [\r\n                blockPositionOnPiece[0] + piecePosition[0],\r\n                blockPositionOnPiece[1] + piecePosition[1]\r\n            ];\r\n            if (blockPositionOnBoard[0] < 0 ||\r\n                blockPositionOnBoard[0] >= Board.BOARD_SIZE ||\r\n                blockPositionOnBoard[1] < 0 ||\r\n                blockPositionOnBoard[1] >= Board.BOARD_SIZE)\r\n                return false;\r\n            const blockIndexOnBoard = Board.positionToIndex(blockPositionOnBoard);\r\n            if (this._fixedBoard[blockIndexOnBoard] === BoardLabel.Filled)\r\n                return false;\r\n        }\r\n        return true;\r\n    }\r\n    clearVisibleBoard() {\r\n        this._visibleBoard = [...this._fixedBoard];\r\n    }\r\n    render() {\r\n        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);\r\n        for (let y = 0; y < Board.BOARD_SIZE; y++) {\r\n            for (let x = 0; x < Board.BOARD_SIZE; x++) {\r\n                switch (this._visibleBoard[y * Board.BOARD_SIZE + x]) {\r\n                    case BoardLabel.Empty:\r\n                        this._context.fillStyle = \"#ddd\";\r\n                        break;\r\n                    case BoardLabel.Filled:\r\n                        this._context.fillStyle = \"#00f\";\r\n                        break;\r\n                    case BoardLabel.CurrentPiece:\r\n                        this._context.fillStyle = \"#0b0\";\r\n                        break;\r\n                    case BoardLabel.WillBreak:\r\n                        this._context.fillStyle = \"#500\";\r\n                        break;\r\n                }\r\n                this._context.fillRect(defaultBoardDrawOptions.position.x + x * defaultBoardDrawOptions.blockSize + x * defaultBoardDrawOptions.gapSize, defaultBoardDrawOptions.position.y + y * defaultBoardDrawOptions.blockSize + y * defaultBoardDrawOptions.gapSize, defaultBoardDrawOptions.blockSize, defaultBoardDrawOptions.blockSize);\r\n            }\r\n        }\r\n    }\r\n    checkClearRegions() {\r\n        const regionsToClear = [];\r\n        Board.CLEAR_REGIONS.forEach(region => {\r\n            for (let i = 0; i < region.length; i++) {\r\n                if (this._fixedBoard[region[i]] === BoardLabel.Empty)\r\n                    return;\r\n            }\r\n            regionsToClear.push(region);\r\n        });\r\n        for (const region of regionsToClear) {\r\n            for (const block of region) {\r\n                this._fixedBoard[block] = BoardLabel.Empty;\r\n            }\r\n        }\r\n    }\r\n    static positionToIndex(position) {\r\n        if (position.length < 2)\r\n            throw Error(`Invalid Position: ${position}`);\r\n        return position[0] + position[1] * Board.BOARD_SIZE;\r\n    }\r\n}\r\nexports.Board = Board;\r\nBoard.BOARD_SIZE = 9;\r\nBoard.CLEAR_REGIONS = [];\r\nfor (let i = 0; i < Board.BOARD_SIZE * 2; i++) {\r\n    Board.CLEAR_REGIONS.push([]);\r\n}\r\nfor (let i = 0; i < Board.BOARD_SIZE; i++) {\r\n    for (let j = 0; j < Board.BOARD_SIZE; j++) {\r\n        Board.CLEAR_REGIONS[i].push(i + j * Board.BOARD_SIZE);\r\n        Board.CLEAR_REGIONS[i + Board.BOARD_SIZE].push(j + i * Board.BOARD_SIZE);\r\n        // Board.CLEAR_REGIONS[i+Board.BOARD_SIZE*2].push(j+i*Board.BOARD_SIZE);\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack://blockdoku/./src/Board.ts?");

/***/ }),

/***/ "./src/Controller.ts":
/*!***************************!*\
  !*** ./src/Controller.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.AllPiecesAI = exports.OneTurnAI = exports.PlayerController = void 0;\r\nconst Board_1 = __webpack_require__(/*! ./Board */ \"./src/Board.ts\");\r\nclass PlayerController {\r\n    placePiece(board, pieces) {\r\n        return new Promise((resolve) => {\r\n            let pieceIndex = -1;\r\n            const keyDownListener = (event) => {\r\n                switch (event.key) {\r\n                    case \"1\":\r\n                        pieceIndex = 0;\r\n                        break;\r\n                    case \"2\":\r\n                        pieceIndex = 1;\r\n                        break;\r\n                    case \"3\":\r\n                        pieceIndex = 2;\r\n                        break;\r\n                }\r\n            };\r\n            const pointerMoveListener = (event) => {\r\n                const posX = Math.floor((event.offsetX - 5) / 44);\r\n                const posY = Math.floor((event.offsetY - 5) / 44);\r\n                if (pieceIndex >= 0 && pieces[pieceIndex] !== undefined) {\r\n                    try {\r\n                        const piece = pieces[pieceIndex];\r\n                        if (piece === undefined)\r\n                            throw Error(\"Invalid piece\");\r\n                        console.debug(`Preview piece ${pieceIndex} at (${posX}|${posY})`);\r\n                        board.previewPiece(piece, [posX, posY]);\r\n                    }\r\n                    catch (error) {\r\n                        board.clearVisibleBoard();\r\n                    }\r\n                    finally {\r\n                        board.render();\r\n                    }\r\n                }\r\n            };\r\n            const pointerUpListener = (event) => {\r\n                const posX = Math.floor((event.offsetX - 5) / 44);\r\n                const posY = Math.floor((event.offsetY - 5) / 44);\r\n                if (pieceIndex >= 0 && pieces[pieceIndex] !== undefined) {\r\n                    window.removeEventListener(\"keydown\", keyDownListener);\r\n                    board.canvas.removeEventListener(\"pointermove\", pointerMoveListener);\r\n                    board.canvas.removeEventListener(\"pointerup\", pointerUpListener);\r\n                    resolve([pieceIndex, posX, posY]);\r\n                }\r\n            };\r\n            window.addEventListener(\"keydown\", keyDownListener);\r\n            board.canvas.addEventListener(\"pointermove\", pointerMoveListener);\r\n            board.canvas.addEventListener(\"pointerup\", pointerUpListener);\r\n        });\r\n    }\r\n}\r\nexports.PlayerController = PlayerController;\r\nfunction delay(milliseconds) {\r\n    return new Promise(resolve => {\r\n        setTimeout(resolve, milliseconds);\r\n    });\r\n}\r\nclass OneTurnAI {\r\n    placePiece(board, pieces) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            let bestTurn = {\r\n                piece: -1,\r\n                position: [0, 0],\r\n                evaluation: -1\r\n            };\r\n            for (let i = 0; i < pieces.length; i++) {\r\n                const piece = pieces[i];\r\n                if (piece === undefined)\r\n                    continue;\r\n                for (let y = 0; y < Board_1.Board.BOARD_SIZE; y++) {\r\n                    for (let x = 0; x < Board_1.Board.BOARD_SIZE; x++) {\r\n                        try {\r\n                            board.previewPiece(piece, [x, y]);\r\n                        }\r\n                        catch (_a) {\r\n                            continue;\r\n                        }\r\n                        board.render();\r\n                        const nextBoard = board.clone();\r\n                        nextBoard.placePiece(piece, [x, y]);\r\n                        yield delay(15);\r\n                        const evaluation = board.evaluate();\r\n                        if (bestTurn.evaluation === -1 || bestTurn.evaluation > evaluation) {\r\n                            bestTurn = {\r\n                                piece: i,\r\n                                position: [x, y],\r\n                                evaluation,\r\n                            };\r\n                        }\r\n                    }\r\n                }\r\n            }\r\n            return [bestTurn.piece, ...bestTurn.position];\r\n        });\r\n    }\r\n}\r\nexports.OneTurnAI = OneTurnAI;\r\nclass AllPiecesAI {\r\n    constructor() {\r\n        this.turnQueue = [];\r\n    }\r\n    placePiece(board, pieces) {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            if (this.turnQueue.length === 0) {\r\n                this.turnQueue = this.checkMoves(board, pieces, []).turns;\r\n            }\r\n            const nextTurn = this.turnQueue.shift();\r\n            if (!nextTurn)\r\n                throw Error(\"Error with turn queue happened\");\r\n            return [nextTurn.piece, ...nextTurn.position];\r\n        });\r\n    }\r\n    checkMoves(board, pieces, turns) {\r\n        if (pieces.every(p => p === undefined)) {\r\n            return {\r\n                turns,\r\n                evaluation: board.evaluate()\r\n            };\r\n        }\r\n        let bestNextMove = {\r\n            turns,\r\n            evaluation: -1\r\n        };\r\n        for (let i = 0; i < pieces.length; i++) {\r\n            const piece = pieces[i];\r\n            if (piece === undefined)\r\n                continue;\r\n            const remainingPieces = [...pieces];\r\n            remainingPieces[i] = undefined;\r\n            for (let y = 0; y < Board_1.Board.BOARD_SIZE; y++) {\r\n                for (let x = 0; x < Board_1.Board.BOARD_SIZE; x++) {\r\n                    try {\r\n                        board.previewPiece(piece, [x, y]);\r\n                    }\r\n                    catch (_a) {\r\n                        continue;\r\n                    }\r\n                    board.render();\r\n                    const nextBoard = board.clone();\r\n                    nextBoard.placePiece(piece, [x, y]);\r\n                    const nextMove = this.checkMoves(nextBoard, remainingPieces, [...turns, { piece: i, position: [x, y] }]);\r\n                    if (bestNextMove.evaluation === -1 || bestNextMove.evaluation > nextMove.evaluation) {\r\n                        bestNextMove = nextMove;\r\n                    }\r\n                }\r\n            }\r\n        }\r\n        return bestNextMove;\r\n    }\r\n}\r\nexports.AllPiecesAI = AllPiecesAI;\r\n\n\n//# sourceURL=webpack://blockdoku/./src/Controller.ts?");

/***/ }),

/***/ "./src/Game.ts":
/*!*********************!*\
  !*** ./src/Game.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\r\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {\r\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\r\n    return new (P || (P = Promise))(function (resolve, reject) {\r\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\r\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\r\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\r\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\r\n    });\r\n};\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Game = void 0;\r\nconst Piece_1 = __webpack_require__(/*! ./Piece */ \"./src/Piece.ts\");\r\nconst lPiece1 = new Piece_1.Piece([\r\n    [0, 0],\r\n    [0, 1],\r\n    [0, 2],\r\n    [1, 2]\r\n]);\r\nconst lPiece2 = new Piece_1.Piece([\r\n    [0, 0],\r\n    [0, 1],\r\n    [0, 2],\r\n    [1, 0]\r\n]);\r\nconst lPiece3 = new Piece_1.Piece([\r\n    [1, 0],\r\n    [1, 1],\r\n    [1, 2],\r\n    [0, 2]\r\n]);\r\nconst lPiece4 = new Piece_1.Piece([\r\n    [1, 0],\r\n    [1, 1],\r\n    [1, 2],\r\n    [0, 0]\r\n]);\r\nconst availablePieces = [\r\n    lPiece1,\r\n    lPiece2,\r\n    lPiece3,\r\n    lPiece4\r\n];\r\nclass Game {\r\n    constructor(board, controller) {\r\n        this.board = board;\r\n        this.controller = controller;\r\n    }\r\n    start() {\r\n        return __awaiter(this, void 0, void 0, function* () {\r\n            this.board.render();\r\n            while (true) {\r\n                const piecesToPlace = this.providePieces();\r\n                while (piecesToPlace.filter(p => p !== undefined).length) {\r\n                    const turn = yield this.controller.placePiece(this.board, piecesToPlace);\r\n                    const pieceIndexToPlace = turn.shift();\r\n                    const position = turn;\r\n                    if (pieceIndexToPlace === undefined)\r\n                        throw Error(\"Invalid turn format\");\r\n                    const pieceToPlace = piecesToPlace[pieceIndexToPlace];\r\n                    if (pieceToPlace === undefined)\r\n                        throw Error(\"Piece has already been placed!\");\r\n                    this.board.placePiece(pieceToPlace, position);\r\n                    console.log(this.board.evaluate());\r\n                    this.board.render();\r\n                    piecesToPlace[pieceIndexToPlace] = undefined;\r\n                }\r\n            }\r\n            this.board.placePiece(lPiece1, [2, 2]);\r\n        });\r\n    }\r\n    providePieces(numberOfPieces = 3) {\r\n        const pieces = [];\r\n        for (let i = 0; i < numberOfPieces; i++)\r\n            pieces.push(availablePieces[Math.floor(Math.random() * availablePieces.length)]);\r\n        return pieces;\r\n    }\r\n}\r\nexports.Game = Game;\r\n\n\n//# sourceURL=webpack://blockdoku/./src/Game.ts?");

/***/ }),

/***/ "./src/Piece.ts":
/*!**********************!*\
  !*** ./src/Piece.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Piece = void 0;\r\nclass Piece {\r\n    constructor(blocks) {\r\n        this.blocks = blocks;\r\n    }\r\n}\r\nexports.Piece = Piece;\r\n\n\n//# sourceURL=webpack://blockdoku/./src/Piece.ts?");

/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst Board_1 = __webpack_require__(/*! ./Board */ \"./src/Board.ts\");\r\nconst Game_1 = __webpack_require__(/*! ./Game */ \"./src/Game.ts\");\r\nconst Controller_1 = __webpack_require__(/*! ./Controller */ \"./src/Controller.ts\");\r\ndocument.addEventListener(\"DOMContentLoaded\", () => {\r\n    const canvas = document.getElementById(\"game\");\r\n    const board = new Board_1.Board(canvas);\r\n    const game = new Game_1.Game(board, new Controller_1.AllPiecesAI);\r\n    game.start();\r\n});\r\n\n\n//# sourceURL=webpack://blockdoku/./src/index.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;