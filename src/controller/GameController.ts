import gsap from "gsap/all";
import {GameScene} from "../components";
import {Cell, Neighbour} from "../components/grid";

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

export class GameController {
	private _config: Config;
	private _gameScene: GameScene;
	private _hasMoves: boolean = true;
	private _isWaterFilled: boolean = false;
	private _results: number[] = [];
	private currectPathLength: number = -1;
	private _timerInterval: any;

	constructor(config: Config) {
		this._config = config;
		this._gameScene = new GameScene(this._config, () => this.restart());
	}

	async loadAssets() {
		// LOADING
		console.log("--LOADING...--");

		await this.gameScene.load();
	}

	async prepareGame() {
		// MAIN_MENU: "MAIN_MENU",
		await this.gameScene.awaitStartClick();
		console.log("--START CLICKED--");

		// PREPARE NEW BOARD
		this.resetBoard();
		this.gameScene.showBoard();
		await this.gameScene.components.menu.hide();
		this.gameScene.activateBoard();
	}

	async startGame() {
		// GAME STARTED, AWAITING INPUT / TIMER END
		this.startTimer();
		await this.mainLoop();
	}

	private async mainLoop() {
		while (this._hasMoves) {
			this.checkHasMoves();
			if (this._hasMoves) {
				await this.waitForMove();
			}
		}
	}

	async findPath(currentCell: Cell) {
		const nextCells = this.getNextCells(currentCell);
		const hasNextCells = nextCells && nextCells.length > 0;
		this.increasePathLength();
		if (hasNextCells) {
			return await Promise.all(
				nextCells.map(async (cell: Cell): Promise<any> => {
					await this.playWaterFlow(cell, 1);
					return this.findPath(cell);
				})
			);
		} else {
			return currentCell;
		}
	}

	private startTimer() {
		this.gameScene.components.timer.reset();
		const intervalDelay = 100;
		this._timerInterval = setInterval(() => this.updateTimer(intervalDelay), intervalDelay);
	}

	private updateTimer(intervalDelay: number) {
		this.gameScene.components.timer.updateTime(
			intervalDelay,
			async () => await this.stopTimer()
		);
	}

	private async stopTimer() {
		clearInterval(this._timerInterval);
		await this.findPath(this.gameScene.getStartCell());
		this._timerInterval = null;
		this._isWaterFilled = true;
		this.finish();
	}

	private checkHasMoves() {
		if (!this.gameScene.hasActiveCells() || this._isWaterFilled) {
			this._hasMoves = false;
		}
	}

	private getNextCells(currentCell: Cell) {
		const validNeighbours = this.gameScene.getValidNeighbours(currentCell);
		if (validNeighbours.length === 0) return null;
		return validNeighbours.map((neighbour: Neighbour) => neighbour.cell);
	}

	private handleResult(pathLength: number) {
		console.log("--NEW RESULT--", this.currectPathLength);
		this.saveResult(pathLength);
		if (this.checkIsMaxResult(pathLength)) {
			this.gameScene.updateMaxResult(this.currectPathLength);
		}
	}

	private saveResult(pathLength: number) {
		this._results.push(pathLength);
	}

	private checkIsMaxResult(pathLength: number) {
		if (pathLength === 0) return false;
		if (this._results.length === 0) return true;

		return Math.max(...this._results) === pathLength;
	}

	private increasePathLength() {
		this.currectPathLength++;
	}

	private async waitForMove() {
		await this.gameScene.waitForMove((cell: Cell) => this.handleMove(cell));
	}

	private async handleMove(cell: Cell) {
		if (this.gameScene.isActive) {
			const currentPipe = this.gameScene.getCurrentPipe();
			cell.addPipe(currentPipe);
		}
	}

	private async playWaterFlow(cell: Cell, delay: number) {
		this.gameScene.playWaterSound();
		await cell.playWaterFlow();
		await new Promise((resolve) => gsap.delayedCall(delay, resolve));
	}

	private async finish() {
		this.handleResult(this.currectPathLength);
		this.gameScene.deactivateBoard();
		await this.gameScene.finish();
	}

	get gameScene() {
		return this._gameScene;
	}

	update() {
		this._gameScene.update();
	}

	private resetBoard() {
		this.gameScene.reset();
	}

	private resetController() {
		clearInterval(this._timerInterval);
		this.currectPathLength = -1;
		this._isWaterFilled = false;
		this._hasMoves = true;
	}

	restart() {
		console.log("--RESTART--");

		this.resetController();
		this.resetBoard();
		this.gameScene.activateBoard();

		this.startGame();
	}
}
