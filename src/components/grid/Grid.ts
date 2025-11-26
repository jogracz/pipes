import {Container} from "pixi.js";
import {getRandomElement} from "../../utils";
import {Pipe} from "../pipes";
import {Cell, CellConfig} from "./Cell";

interface GridConfig {
	columnsCount: number;
	rowsCount: number;
	blockersCount: number;
}

export class Grid extends Container {
	private config: GridConfig;
	private allCells: Cell[] = [];
	private blockedCells: Cell[] = [];
	private _startCell: Cell;
	private _isActive: boolean = false;
	constructor(config: GridConfig) {
		super();
		this.config = config;

		this.populate();
	}

	populate() {
		const padding = 2;
		for (let i = 0; i < this.config.columnsCount; i++) {
			for (let j = 0; j < this.config.rowsCount; j++) {
				const cell = new Cell({gridColumn: i, gridRow: j});
				this.allCells.push(cell);
				cell.x = i * (cell.width + padding);
				cell.y = j * (cell.height + padding);
				this.addChild(cell);
			}
		}
	}

	private resetRandomBlockers() {
		this.allCells.forEach((cell: Cell) => {
			cell.unblock();
		});

		for (let i = 0; i < this.config.blockersCount; i++) {
			const randomCell: Cell = getRandomElement(this.allCells);
			if (!randomCell.isBlocked) {
				randomCell.block();
				this.blockedCells.push(randomCell);
			}
		}
	}

	private resetRandomStart(startPipe: Pipe) {
		this._startCell = getRandomElement(
			this.allCells
				.filter((cell: Cell) => this.getIsNotLastRow(cell))
				.filter((cell: Cell) => this.getIsNotBlocked(cell))
		);

		this._startCell.setStartPipe(startPipe);
	}

	get startCell() {
		return this._startCell;
	}

	getIsNotLastRow(cell: Cell) {
		return cell.config.gridRow !== this.config.rowsCount - 1;
	}

	getIsNotBlocked(cell: Cell) {
		return !cell.isBlocked;
	}

	getHasValidConnection(cell1: Cell, cell2: Cell) {}

	//     getConnectionDirections(cell:Cell) {
	// cell.pipe.
	//     }

	activate() {
		this._isActive = true;
		this.allCells.forEach((cell: Cell) => cell.setActive(!cell.isBlocked && !cell.hasPipe));
	}

	deactivate() {
		this._isActive = false;
		this.allCells.forEach((cell: Cell) => cell.setActive(false));
	}

	getActiveCells() {
		return this.allCells.filter((cell: Cell) => cell.isActive);
	}

	async waitForMove(callback: (cell: Cell) => void) {
		await Promise.any(
			this.getActiveCells().map(async (cell: Cell) => cell.waitForMove(callback))
		);
	}

	private getNeighbours(cell: Cell) {
		const gridColumn = cell.config.gridColumn;
		const gridRow = cell.config.gridRow;
		// const columnsCount = this.config.columnsCount; //9
		// const rowsCount = this.config.rowsCount; //7

		const neighbours = {
			// NORTH / TOP
			NN: this.findCell({gridColumn, gridRow: gridRow - 1}),
			// SOUTH / DOWN
			SS: this.findCell({gridColumn, gridRow: gridRow + 1}),
			// EAST / RIGHT
			EE: this.findCell({gridColumn: gridColumn + 1, gridRow}),
			// WEST / LEFT
			WW: this.findCell({gridColumn: gridColumn - 1, gridRow}),

			// // NORTH-EAST / TOP-RIGHT
			// NE: this.findCell({
			//     gridColumn: gridColumn + 1,
			//     gridRow: gridRow - 1,
			// }),
			// // NORTH-WEST / TOP-LEFT
			// NW: this.findCell({
			//     gridColumn: gridColumn - 1,
			//     gridRow: gridRow - 1,
			// }),
			// // SOUTH-EAST / DOWN-RIGHT
			// SE: this.findCell({
			//     gridColumn: gridColumn + 1,
			//     gridRow: gridRow + 1,
			// }),
			// // SOUTH-WEST / DOWN-LEST
			// SW: this.findCell({
			//     gridColumn: gridColumn - 1,
			//     gridRow: gridRow + 1,
			// }),
		};
		console.log(neighbours);
		return neighbours;
	}

	getValidNeighbours(cell: Cell) {
		const neighbours = Object.values(this.getNeighbours(cell));

		return neighbours
			.filter((cell: Cell) => !!cell)
			.filter((cell: Cell) => !cell.isBlocked)
			.filter((cell: Cell) => cell.hasPipe);
		// .filter().canconnect()
	}

	findCell({gridColumn, gridRow}: CellConfig) {
		if (
			gridColumn < 0 ||
			gridRow < 0 ||
			gridColumn >= this.config.columnsCount ||
			gridRow >= this.config.rowsCount
		) {
			return null;
		}

		return this.allCells.find((cell: Cell) => cell.checkPositionMatch({gridColumn, gridRow}));
	}

	reset(startPipe: Pipe) {
		this.resetRandomBlockers();
		this.resetRandomStart(startPipe);
	}

	relayout() {
		this.scale.set(1.5);
		this.x = -this.width / 2;
		this.y = -this.height / 2;
	}
}
