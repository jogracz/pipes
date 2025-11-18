import { Container } from "pixi.js";
import { getRandomElement } from "../../utils";
import { Cell } from "./Cell";

interface GridConfig {
    columnsCount: number;
    rowsCount: number;
    blockersCount: number;
}

export class Grid extends Container {
    private config: GridConfig;
    private allCells: Cell[] = [];
    private blockedCells: Cell[] = [];
    private _isActive: boolean = false;
    constructor(config: GridConfig) {
        super();
        this.config = config;

        this.initiate();
        this.resetRandomBlockers();
    }

    initiate() {
        const padding = 10;
        for (let i = 0; i < this.config.columnsCount; i++) {
            for (let j = 0; j < this.config.rowsCount; j++) {
                const cell = new Cell({ gridColumn: i, gridRow: j });
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

    private resetRandomStart() {
        const randomCell = getRandomElement(
            this.allCells
                .filter(this.getIsNotLastRow)
                .filter(this.getIsNotBlocked)
        );

        randomCell.setStart();
    }

    filterForStartCell(array: any[]) {
        return array.filter(
            (cell: Cell) => cell.config.gridRow !== this.config.rowsCount - 1
        );
    }

    getIsNotLastRow(cell: Cell) {
        return cell.config.gridRow !== this.config.rowsCount - 1;
    }

    getIsNotBlocked(cell: Cell) {
        return !cell.isBlocked;
    }

    activate() {
        this._isActive = true;
        this.allCells.forEach((cell: Cell) => cell.setActive(!cell.isBlocked));
    }

    deactivate() {
        this._isActive = false;
        this.allCells.forEach((cell: Cell) => cell.setActive(false));
    }

    reset() {
        this.resetRandomBlockers();
        this.resetRandomStart();
    }
}
