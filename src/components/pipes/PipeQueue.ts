import {Container} from "pixi.js";
import {Pipe} from "./Pipe";
import {RandomPipeGenerator} from "./RandomPipeGenerator";
import gsap from "gsap";

interface PipeQueueConfig {
	length: number;
}

export class PipeQueue extends Container {
	private _config: PipeQueueConfig;
	private _randomPipeGenerator: RandomPipeGenerator;
	private pipes: Pipe[] = [];
	private _isActive = false;

	constructor(config: PipeQueueConfig, randomPipeGenerator: RandomPipeGenerator) {
		super();
		this._config = config;
		this._randomPipeGenerator = randomPipeGenerator;
	}

	populate() {
		for (let i = 0; i < this._config.length; i++) {
			const pipe = this._randomPipeGenerator.generate();
			pipe.y = i * this.getSpacing();
			this.pipes.push(pipe);
			this.addChild(pipe);
		}
	}

	getSpacing() {
		const padding = 10;
		return Pipe.spriteHeight + padding;
	}

	getCurrentPipe(): Pipe {
		const currentPipe = this.pipes.shift();
		currentPipe.setActive(false);
		currentPipe.y = 0;
		this.addNewPipe();
		return currentPipe;
	}

	async addNewPipe() {
		const newPipe = this._randomPipeGenerator.generate();
		newPipe.y = this._config.length * this.getSpacing();
		this.addChild(newPipe);
		this.pipes.push(newPipe);
		await this.rearangePipes();
	}

	async rearangePipes() {
		this.deactivate();
		await Promise.all(
			this.pipes.map(async (pipe: Pipe) => {
				const currentY = pipe.y;
				return await gsap.to(pipe, {
					y: currentY - this.getSpacing(),
					duration: 0.3,
				});
			})
		);
		this.activate();
	}

	activateCurrentPipe() {
		this.pipes[0].setActive(true);
	}

	activate() {
		this._isActive = true;
		this.activateCurrentPipe();
	}

	deactivate() {
		this._isActive = false;
		this.pipes.forEach((pipe: Pipe) => pipe.setActive(false));
	}

	get isActive() {
		return this._isActive;
	}

	reset() {
		// TOD: Add Pooling
		this.clean();
		this.populate();
		this.activate();
	}

	clean() {
		this.pipes.forEach((pipe: Pipe) => pipe.destroy());
		this.pipes = [];
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
