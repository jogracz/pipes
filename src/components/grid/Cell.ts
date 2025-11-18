import { Container, Graphics } from "pixi.js";
import { Pipe } from "../pipes";

interface CellConfig {
    gridColumn: number;
    gridRow: number;
}
const COLOR_DEFAULT = "blue";
const OPACITY_BLOCKED = 0.2;
const OPACITY_DEFAULT = 1;
export class Cell extends Container {
    config: CellConfig;
    private background: Graphics;
    private _isBlocked = false;
    private _isActive: boolean = false;
    pipe: Pipe;

    constructor(config: CellConfig) {
        super();
        this.config = config;
        this.background = new Graphics().rect(0, 0, 32, 32).fill(COLOR_DEFAULT);
        this.eventMode = "static";
        this.addChild(this.background);
    }

    get isBlocked() {
        return this._isBlocked;
    }

    block() {
        this._isBlocked = true;
        this.alpha = OPACITY_BLOCKED;
    }

    unblock() {
        this._isBlocked = false;
        this.alpha = OPACITY_DEFAULT;
    }

    addPipe(pipe: Pipe) {
        this.pipe = pipe;
    }

    removePipe() {
        this.pipe = null;
    }

    setActive(value: boolean) {
        console.log("active", value);
        this._isActive = value;
        if (value) {
            this.cursor = "pointer";
        } else {
            this.cursor = "arrow";
        }
    }

    reset() {
        this.removePipe();
        this.unblock();
        this.setActive(false);
    }
}
