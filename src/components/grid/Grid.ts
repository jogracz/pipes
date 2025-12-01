import {Container} from "pixi.js";
import {getRandomElement} from "../../utils";
import {DIRECTION, Pipe} from "../pipes";
import {Cell, CellConfig} from "./Cell";

interface GridConfig {
	columnsCount: number;
	rowsCount: number;
	blockersCount: number;
}

export type Neighbour = {
	direction: DIRECTION;
	cell?: Cell;
};
export class Grid extends Container {
	private config: GridConfig;
	private _clickSound: Howl;
	private allCells: Cell[] = [];
	private blockedCells: Cell[] = [];
	private _startCell: Cell;
	private _isActive: boolean = false;
	constructor(config: GridConfig, clickSound: Howl) {
		super();
		this.config = config;
		this._clickSound = clickSound;

		this.populate();
	}

	populate() {
		const padding = 2;
		for (let i = 0; i < this.config.columnsCount; i++) {
			for (let j = 0; j < this.config.rowsCount; j++) {
				const cell = new Cell({gridColumn: i, gridRow: j}, this._clickSound);
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

	getHasValidConnection(cell1: Cell, cell2: Cell) {
		cell1.pipe.getConnectionDirections();
		cell2.pipe.getConnectionDirections();
	}

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

	private getAllNeighbours(cell: Cell): Neighbour[] {
		const gridColumn = cell.config.gridColumn;
		const gridRow = cell.config.gridRow;

		const neighbours: Neighbour[] = [
			{
				// NORTH / TOP
				direction: DIRECTION.NN,
				cell: this.findCell({gridColumn, gridRow: gridRow - 1}),
			},
			{
				// EAST / RIGHT
				direction: DIRECTION.EE,
				cell: this.findCell({gridColumn: gridColumn + 1, gridRow}),
			},
			{
				// SOUTH / DOWN
				direction: DIRECTION.SS,
				cell: this.findCell({gridColumn, gridRow: gridRow + 1}),
			},
			{
				// WEST / LEFT
				direction: DIRECTION.WW,
				cell: this.findCell({gridColumn: gridColumn - 1, gridRow}),
			},
		];

		return neighbours;
	}

	getValidNeighbours(cell: Cell) {
		const neighbours = this.getAllNeighbours(cell);
		const originCellDirections = cell.pipe.getConnectionDirections();

		return neighbours
			.filter((neighbour: Neighbour) => !!neighbour.cell)
			.filter((neighbour: Neighbour) => !neighbour.cell.isBlocked)
			.filter((neighbour: Neighbour) => neighbour.cell.hasPipe)
			.filter((neighbour: Neighbour) => !neighbour.cell.isStart)
			.filter((neighbour: Neighbour) => !neighbour.cell.isFilled)
			.filter((neighbour: Neighbour) => originCellDirections.includes(neighbour.direction))
			.filter((neighbour: Neighbour) =>
				this.areMatchingDirections(
					neighbour.direction,
					neighbour.cell.pipe.getConnectionDirections()
				)
			);
	}

	areMatchingDirections(dir1: DIRECTION, dirArray: DIRECTION[]) {
		if (dir1 === DIRECTION.NN) {
			// NORTH matches SOUTH
			return dirArray.includes(DIRECTION.SS);
		} else if (dir1 === DIRECTION.EE) {
			// EAST matches WEST
			return dirArray.includes(DIRECTION.WW);
		} else if (dir1 === DIRECTION.SS) {
			// SOUTH matches NORTH
			return dirArray.includes(DIRECTION.NN);
		} else if (dir1 === DIRECTION.WW) {
			// WEST matches EAST
			return dirArray.includes(DIRECTION.EE);
		}
		return false;
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
