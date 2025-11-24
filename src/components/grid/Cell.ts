import gsap from "gsap/all";
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
        this.background = new Graphics()
            .rect(-16, -16, 32, 32)
            .fill(COLOR_DEFAULT);

        this.addChild(this.background);

        this.eventMode = "static";
        this.on("pointerover", this.onHover);
    }

    get isBlocked() {
        return this._isBlocked;
    }
    async onHover() {
        if (this.isBlocked && !this._isActive) return;
        const vars = {
            scale: 1,
        };
        await gsap.to(vars, {
            scale: 0.95,
            onUpdate: () => {
                this.scale.set(vars.scale);
            },
            duration: 0.15,
        });

        await gsap.to(vars, {
            scale: 1.05,
            onUpdate: () => {
                this.scale.set(vars.scale);
            },
            duration: 0.15,
        });
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
