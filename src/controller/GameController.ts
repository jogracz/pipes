import gsap from "gsap/all";
import {GameScene} from "../components";
import {Cell, Neighbour} from "../components/grid";
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
	private _config: Config;
	private _gameScene: GameScene;
	private _hasMoves: boolean = true;
	private _isEvaluating: boolean = true;
	private _isWaterFilled: boolean = false;
	private _currentPipe: Pipe;
	private _results: Result[] = [];
	private currectPathLength: number = -1;
	private _timerInterval: any;
	private _longestPath: Cell[] = [];
	private allPaths: Cell[][] = [];
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
		this.startTimer();
		await this.mainLoop();
		console.log("Mainloop stop");

		// EVALUATING: "EVALUATING",

		// await this.pathFindingLoop(this.gameScene.getStartCell());

		// RESULT: "RESULT",

		// show result screen

		// AWAITING_INPUT: "AWAITING_INPUT", //START AGAIN?
	}

	private async mainLoop() {
		while (this._hasMoves) {
			// await new Promise((resolve) => gsap.delayedCall(1, resolve));
			this.checkHasMoves();
			// Add exiting if no moves were made and time out
			if (this._hasMoves) {
				await this.waitForMove();
			}
		}
	}

	private async pathFindingLoop(startCell: Cell) {
		console.log("Evaluating start");
		let currentCell = startCell;
		while (this._isEvaluating) {
			// const nextCell = this.getNextCell(currentCell);
			const nextCells = this.getNextCells(currentCell);
			console.log("hasPath from ", currentCell.config, !!nextCells);
			// await new Promise((resolve) => gsap.delayedCall(1, resolve));
			if (nextCells && nextCells.length > 0) {
				await Promise.all(
					nextCells.map(async (cell: Cell) => {
						// this.pathFindingLoop(cell);
						return await this.playWaterFlow(cell, 1);
					})
				);
				currentCell = nextCells[0];
				// await this.playWaterFlow(nextCell, 1);
				// change currentCell //this.checkHasPath change to finNextCell
				// currentCell = nextCell;
				this.currectPathLength++;
				this.pathFindingLoop(currentCell);
			} else {
				console.log("Evaluating stop");
				this._isEvaluating = false;
				this._isWaterFilled = true;
				this.handleResult(this.currectPathLength);
				console.log("YOUR ESULT:", this.currectPathLength);
				// gamescene.deactivate()
			}
		}
	}

	async test(currentCell: Cell, currentPath: Cell[] = []) {
		// let currentLength = 0;
		// let newLength = 0;
		// let startCell = this.gameScene.getStartCell();
		// let currentCell = this.gameScene.getStartCell();
		let longestPath: Cell[] = [];
		const allPaths: Cell[][] = [];
		const allPathsObject: any = {};

		longestPath.push(currentCell);
		const nextCells = this.getNextCells(currentCell);
		const hasNextCells = nextCells && nextCells.length > 0;
		console.log(currentCell.config);
		currentPath.push(currentCell);
		console.log(currentPath);
		this.currectPathLength++;
		if (hasNextCells) {
			allPaths.push([currentCell]);
			nextCells.forEach((cell: Cell) => {
				// allPaths.push(cell)
			});
			// currentLength++;

			return await Promise.all(
				nextCells.map(async (cell: Cell): Promise<any> => {
					// const nextCells2 = this.getNextCells(cell);
					await this.playWaterFlow(cell, 1);

					return this.test(cell, currentPath);
				})
			);
		} else {
			return currentCell;
		}
		// if (newLength > currentLength) {
		// }
	}

	async startTimer() {
		//this async and Promise.race with waterfill
		const intervalDelay = 100;
		this._timerInterval = setInterval(() => this.updateTimer(intervalDelay), intervalDelay);
	}

	updateTimer(intervalDelay: number) {
		this.gameScene.components.timer.updateTime(
			intervalDelay,
			async () => await this.stopTimer() //await?
		);
	}

	async stopTimer() {
		clearInterval(this._timerInterval);
		// await this.pathFindingLoop(this.gameScene.getStartCell());
		await this.test(this.gameScene.getStartCell());
		this._timerInterval = null;
		this._isEvaluating = false;
		this._isWaterFilled = true;
		this.handleResult(this.currectPathLength);
		console.log("YOUR ESULT:", this.currectPathLength);
		console.log("all paths:", this.allPaths);
	}

	checkHasMoves() {
		if (!this.gameScene.hasActiveCells() || this._isWaterFilled) {
			this._hasMoves = false;
		}
	}

	getNextCell(currentCell: Cell) {
		const validNeighbours = this.gameScene.getValidNeighbours(currentCell);
		console.log("VALID NEIGHBOURS", validNeighbours);
		if (validNeighbours.length === 0) return null;
		return validNeighbours[0].cell; //forEach
	}

	getNextCells(currentCell: Cell) {
		const validNeighbours = this.gameScene.getValidNeighbours(currentCell);
		console.log("VALID NEIGHBOURS", validNeighbours);
		if (validNeighbours.length === 0) return null;
		return validNeighbours.map((neighbour: Neighbour) => neighbour.cell);
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
		this._longestPath = [];
	}
}
