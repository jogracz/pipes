import gsap from "gsap/all";
import {GameScene} from "../components";
import {Cell, CellConfig} from "../components/grid";
import {Pipe} from "../components/pipes";

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

type Result = {
	pathLength: number;
	date: Date;
};

export interface Config {
	gameName: string;
	grid: {
		columns: number;
		rows: number;
		blockedCells: number;
	};
	waterStartDelayinMs: number;
	pipeQueueLength: number;
}

export class GameMediator {
	private _config: any;
	private _gameScene: GameScene;
	private _hasMoves: boolean = true;
	private _isEvaluating: boolean = true;
	private _currentPipe: Pipe;
	private _results: Result[] = [];
	private currectPathLength: number = 0;
	// private _startCell: Cell;

	constructor(config: Config) {
		this._config = config;
		this._gameScene = new GameScene(this._config);
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

		// AWAITING_INPUT: "AWAITING_INPUT",
		console.log("Mainloop start");
		await this.mainLoop();
		console.log("Mainloop stop");

		// EVALUATING: "EVALUATING",
		console.log("Evaluating start");
		await this.pathFindingLoop(this.gameScene.getStartCell());
		console.log("Evaluating stop");

		// RESULT: "RESULT",
		this.handleResult(this.currectPathLength);
		// show result screen

		// AWAITING_INPUT: "AWAITING_INPUT", //START AGAIN?
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
			const nextCell = this.getNextCell(currentCell);
			console.log("hasPath", nextCell);
			await new Promise((resolve) => gsap.delayedCall(1, resolve));
			if (nextCell) {
				await this.playWaterFlow(nextCell, 1);
				// change currentCell //this.checkHasPath change to finNextCell
				// currentCell = nextCell;
				this.currectPathLength++;
				// this.pathFindingLoop(currentCell)
			} else {
				this._isEvaluating = false;
			}
		}
	}

	checkHasMoves() {
		if (!this.gameScene.hasActiveCells()) {
			this._hasMoves = false;
		}
	}

	getNextCell(currentCell: Cell) {
		const validNeighbours = this.gameScene.getValidNeighbours(currentCell);
		console.log("VALID NEIGHBOURS", validNeighbours);
		if (validNeighbours.length === 0) return null;
		return validNeighbours[0].cell; //forEach
	}

	handleResult(pathLength: number) {
		console.log("max win", this.checkIsMaxResult(pathLength));

		this.saveResult(pathLength);
	}

	saveResult(pathLength: number) {
		console.log("pathLength", pathLength);
		const date = new Date();
		this._results.push({
			pathLength,
			date,
		});
	}

	checkIsMaxResult(pathLength: number) {
		if (pathLength === 0) return false;
		if (this._results.length === 0) return true;

		this._results.forEach((result: Result) => {
			if (result.pathLength < pathLength) {
				return true;
			}
		});
		return false;
	}

	increasePathLength() {
		this.currectPathLength++;
	}

	async waitForMove() {
		await this.gameScene.waitForMove((cell: Cell) => this.handleMove(cell));
	}

	async handleMove(cell: Cell) {
		// if (this.gameScene.components.pipeQueue.isActive) {
		console.log(cell.config);
		const currentPipe = this.gameScene.getCurrentPipe();
		cell.addPipe(currentPipe);
		// }
	}

	// async evaluate() {
	//     this.gameScene.components.grid.getNeighbours(
	//         this.gameScene.getStartCell()
	//     );
	// }

	async playWaterFlow(cell: Cell, delay: number) {
		await cell.playWaterFlow();
		await new Promise((resolve) => gsap.delayedCall(delay, resolve));
	}

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
