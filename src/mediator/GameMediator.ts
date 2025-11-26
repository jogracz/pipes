import gsap from "gsap/all";
import { GameScene } from "../components";
import { Cell, CellConfig } from "../components/grid";
import { Pipe } from "../components/pipes";

export const GAME_STATE = {
    LOADING: "LOADING",
    MAIN_MENU: "MAIN_MENU",
    GAME_STARTED: {
        AWAITING_INPUT: "AWAITING_INPUT",
        EVALUATING: "EVALUATING",
    },
    GAME_OVER: {
        EVALUATING: "EVALUATING",
        RESULT: "RESULT",
        AWAITING_INPUT: "AWAITING_INPUT", //START AGAIN?
    },
};
export class GameMediator {
    private _gameScene: GameScene;
    private _hasMoves: boolean = true;
    private _isEvaluating: boolean = true;
    private _currentPipe: Pipe;
    // private _startCell: Cell;

    constructor() {
        this._gameScene = new GameScene();
    }

    // LOADING: "LOADING",
    async loadAssets() {
        await this.gameScene.load();
    }

    async startGame() {
        // MAIN_MENU: "MAIN_MENU",
        await this.gameScene.components.menu.awaitStartClick();

        // PREPARE NEW BOARD
        this.resetBoard();
        this.gameScene.showBoard();
        await this.gameScene.components.menu.hide();
        this.gameScene.activateBoard();
        console.log("Mainloop start");

        // AWAITING_INPUT: "AWAITING_INPUT",
        await this.mainLoop();

        console.log("Mainloop stop");
        console.log("Evaluating start");
        await this.pathFindingLoop(this.gameScene.getStartCell());
        console.log("Evaluating stop");
        // EVALUATING: "EVALUATING",
    }

    private async mainLoop() {
        while (this._hasMoves) {
            // await new Promise((resolve) => gsap.delayedCall(1, resolve));
            await this.waitForMove();
            this.checkHasMoves();
        }
    }

    private async pathFindingLoop(startCell: Cell) {
        let currentCell = startCell;
        while (this._isEvaluating) {
            this.checkHasPath(startCell);
            // await new Promise((resolve) => gsap.delayedCall(1, resolve));
            await this.waitForMove();
        }
    }

    checkHasMoves() {
        if (!this.gameScene.hasActiveCells()) {
            this._hasMoves = false;
        }
    }

    checkHasPath(currentCell: Cell) {
        const validNeighbours = this.gameScene.getValidNeighbours(currentCell);
        if (validNeighbours.length === 0) return false;

        // if (!this.gameScene.hasActiveCells()) {
        //     this._hasMoves = false;
        // }
    }

    async waitForMove() {
        console.log(1);
        await this.gameScene.waitForMove((cell: Cell) => this.handleMove(cell));
        console.log(2);
    }

    async handleMove(cell: Cell) {
        console.log(cell.config);
        const currentPipe = this.gameScene.getCurrentPipe();
        cell.addPipe(currentPipe);
    }

    // async evaluate() {
    //     this.gameScene.components.grid.getNeighbours(
    //         this.gameScene.getStartCell()
    //     );
    // }

    get gameScene() {
        return this._gameScene;
    }

    update() {
        this._gameScene.update();
    }

    resetBoard() {
        this.gameScene.reset();
    }
}
