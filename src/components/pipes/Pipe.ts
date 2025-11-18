import { Container, Sprite, Texture } from "pixi.js";

interface PipeConfig {
    texture: Texture;
    rotation: number;
}

export class Pipe extends Container {
    private _id: number;
    private _config: PipeConfig;
    private _sprite: Sprite;
    private _isActive = false;

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
        } else {
            this.cursor = "arrow";
        }
    }
}
