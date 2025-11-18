import { Container, Sprite, Texture } from "pixi.js";

interface PipeConfig {
    texture: Texture;
    rotation: number;
}

export class Pipe extends Container {
    private _id: number;
    private _config: PipeConfig;
    private _sprite: Sprite;
    private _isActive: boolean = false;

    private _isGrowing: boolean = false;

    constructor(config: PipeConfig) {
        super(config.texture);

        this._config = config;
        this._sprite = Sprite.from(config.texture);
        this._sprite.anchor.set(0.5);
        this.angle = config.rotation;
        this.eventMode = "static";

        this.addChild(this._sprite);
    }

    setActive(value: boolean) {
        this._isActive = value;
        if (value) {
            this.cursor = "pointer";
            this._isGrowing = true;
        } else {
            this.cursor = "arrow";
            this._isGrowing = false;
        }
    }

    animateActive() {
        if (this._isGrowing) {
            if (this.scale.x < 1.2) {
                this.scale.set(this.scale.x + 0.02);
            } else {
                this._isGrowing = false;
            }
        } else {
            if (this.scale.x > 0.8) {
                this.scale.set(this.scale.x - 0.02);
            } else {
                this._isGrowing = true;
            }
        }
    }

    update() {
        if (this._isActive) {
            this.animateActive();
        }
    }

    reset() {
        this.setActive(false);
    }
}
