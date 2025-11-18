import { Container } from "pixi.js";
import { Cell } from "./Cell";

interface GridConfig {
    columns: number;
    rows: number;
}

export class Grid extends Container {
    private config: GridConfig;
    constructor(config: GridConfig) {
        super();
        this.config = config;

        this.initiate();
    }

    initiate() {
        const padding = 5;
        for (let i = 0; i < this.config.columns; i++) {
            for (let j = 0; j < this.config.rows; j++) {
                const cell = new Cell({ gridColumn: i, gridRow: j });
                cell.x = i * (cell.width + padding);
                cell.y = j * (cell.height + padding);
                this.addChild(cell);
            }
        }
    }
}
