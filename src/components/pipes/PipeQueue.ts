import { Container } from "pixi.js";
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

        this.populate();
    }

    populate() {
        for (let i = 0; i < this._config.length; i++) {
            const pipe = this._randomPipeGenerator.generate();
            pipe.y = i * this.getSpacing(pipe);
            this.pipes.push(pipe);
            this.addChild(pipe);
        }
    }

    getSpacing(pipe: Pipe) {
        const padding = 10;
        return pipe.height + padding;
    }

    getCurrentPipe(): Pipe {
        const currentPipe = this.pipes.shift();
        this.addNewPipe();
        return currentPipe;
    }

    addNewPipe() {
        const newPipe = this._randomPipeGenerator.generate();
        newPipe.position.copyFrom(this.pipes[this.pipes.length - 1].position);
        this.addChild(newPipe);
        this.rearangePipes();
        this.pipes.push(newPipe);
    }

    rearangePipes() {
        this.pipes.forEach((pipe: Pipe) => {
            pipe.y = pipe.y - this.getSpacing(pipe);
        });
    }

    activate() {
        this._isActive = true;
        this.pipes[0].setActive(true);
    }

    deactivate() {
        this._isActive = false;
        this.pipes.forEach((pipe: Pipe) => pipe.setActive(false));
    }

    reset() {
        // this.clean();
        // this.populate();
        // this.pipes.forEach((pipe: Pipe) => pipe.reset());
        this.activate();
    }

    clean() {
        this.pipes.forEach((pipe: Pipe) => pipe.destroy());
    }

    update() {
        this.pipes.forEach((pipe: Pipe) => pipe.update());
    }

    relayout() {
        this.scale.set(1.5);
        this.x = -this.width;
        this.y = -this.height / 2;
    }
}
