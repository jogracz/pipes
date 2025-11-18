import { Container, Graphics } from "pixi.js";

interface CellConfig {
    gridColumn: number;
    gridRow: number;
}

export class Cell extends Container {
    private config: CellConfig;
    private background: Graphics;

    constructor(config: CellConfig) {
        super();
        this.config = config;
        this.background = new Graphics().rect(0, 0, 50, 50).fill("blue");
        this.addChild(this.background);
    }
}
