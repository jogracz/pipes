import { Container, Sprite, Texture } from "pixi.js";
import { Pipe } from "./Pipe";
import { RandomPipeGenerator } from "./RandomPipeGenerator";

interface PipeQueueConfig {
    length: number;
}

export class PipeQueue extends Container {
    private _config: PipeQueueConfig;
    private _randomPipeGenerator: RandomPipeGenerator;
    private pipes: Pipe[];
    private _isActive = false;

    constructor(
        config: PipeQueueConfig,
        randomPipeGenerator: RandomPipeGenerator
    ) {
        super();
        this._config = config;
        this._randomPipeGenerator = randomPipeGenerator;
        // this.eventMode = "static";

        this.initiate();
    }

    initiate() {
        const padding = 10;
        for (let i = 0; i < this._config.length; i++) {
            const pipe = this._randomPipeGenerator.generate();
            console.log(pipe);
            pipe.y = i * (pipe.height + padding);
            this.addChild(pipe);
        }
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
