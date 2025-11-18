import { Container, Sprite, Texture } from "pixi.js";
import { Pipe } from "./Pipe";
import { RandomPipeGenerator } from "./RandomPipeGenerator";

interface PipeQueueConfig {
    length: number;
}

export class PipeQueue extends Container {
    private _config: PipeQueueConfig;
    private _randomPipeGenerator: RandomPipeGenerator;
    private pipes: Pipe[] = [];
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
            pipe.y = i * (pipe.height + padding);
            this.pipes.push(pipe);
            this.addChild(pipe);
        }
    }

    // setActive(value: boolean) {
    //     this._isActive = value;
    //     if (value) {
    //         this.cursor = "pointer";
    //     } else {
    //         this.cursor = "arrow";
    //     }
    // }

    activate() {
        this._isActive = true;
        this.pipes[0].setActive(true);
    }

    deactivate() {
        this._isActive = false;
        this.pipes.forEach((pipe: Pipe) => pipe.setActive(false));
    }

    reset() {
        this.pipes.forEach((pipe: Pipe) => pipe.reset());
    }

    update() {
        this.pipes.forEach((pipe: Pipe) => pipe.update());
    }
}
