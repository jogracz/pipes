import gsap from "gsap/all";
import {Container, Graphics} from "pixi.js";
import {Pipe} from "../pipes";

export interface CellConfig {
	gridColumn: number;
	gridRow: number;
}
const COLOR_DEFAULT = "#f3f1e9ff";
// const COLOR_DEFAULT = "#ffffff";
const OPACITY_BLOCKED = 0.4;
const OPACITY_DEFAULT = 0.9;
export class Cell extends Container {
	private _config: CellConfig;
	private _clickSound: Howl;
	private _background: Graphics;
	private _isBlocked = false;
	private _isActive: boolean = false;
	private _isStart: boolean = false;
	private _pipeContainer: Container = new Container();
	pipe: Pipe;

	constructor(config: CellConfig, clickSound: Howl) {
		super();
		this._config = config;
		this._clickSound = clickSound;

		this._background = new Graphics().roundRect(-16, -16, 32, 32, 4).fill(COLOR_DEFAULT);

		this.addChild(this._background);
		this.addChild(this._pipeContainer);

		this.eventMode = "static";
	}

	get config() {
		return this._config;
	}

	private async onHover() {
		if (this.isBlocked && !this._isActive) return;
		const vars = {
			scale: 1,
		};
		await gsap.to(vars, {
			scale: 0.9,
			onUpdate: () => {
				this.scale.set(vars.scale);
			},
			duration: 0.1,
		});

		await gsap.to(vars, {
			scale: 0.95,
			onUpdate: () => {
				this.scale.set(vars.scale);
			},
			duration: 0.05,
		});
	}

	private async onHoverEnd() {
		if (this.isBlocked && !this._isActive) return;

		const vars = {
			scale: 0.95,
		};

		await gsap.to(vars, {
			scale: 1,
			onUpdate: () => {
				this.scale.set(vars.scale);
			},
			duration: 0.15,
		});
	}

	get isBlocked() {
		return this._isBlocked;
	}

	get hasPipe() {
		return !!this.pipe;
	}

	get isActive() {
		return this._isActive;
	}

	get isFilled() {
		return this.pipe && this.pipe.isFilled;
	}

	block() {
		this._isBlocked = true;
		this._background.alpha = OPACITY_BLOCKED;
	}

	unblock() {
		this._isBlocked = false;
		this._background.alpha = OPACITY_DEFAULT;
	}

	addPipe(pipe: Pipe) {
		this.setActive(false);
		this.pipe = pipe;
		this.pipe.visible = true;
		this._pipeContainer.addChild(this.pipe);
		this.pipe.position.set(0);
	}

	removePipe() {
		this._pipeContainer.removeChildren();
		this.pipe = null;
	}

	private addHoverAnimation() {
		this.cursor = "pointer";
		this.onpointerover = () => this.onHover();
		this.onpointerout = () => this.onHoverEnd();
	}

	private removeHoverAnimation() {
		this.cursor = "arrow";
		this.onpointerover = null;
		this.onpointerout = null;
	}

	setActive(value: boolean) {
		this._isActive = value;
		if (value) {
			this.addHoverAnimation();
		} else {
			this.removeHoverAnimation();
			this.scale.set(1);
		}
	}

	private setStart(value: boolean) {
		this._isStart = value;
	}

	get isStart() {
		return this._isStart;
	}

	setStartPipe(startPipe: Pipe) {
		this.addPipe(startPipe);
		this.setStart(true);
	}

	async waitForMove(callback: (cell: Cell) => void) {
		await new Promise<void>((resolve) => {
			const onClick = () => {
				this._clickSound.play();
				resolve();
				callback(this);
			};
			this.onpointerdown = onClick;
			this.cursor = "pointer";
		});
		this.onpointerdown = null;
		this.cursor = "arrow";
	}

	async playWaterFlow() {
		if (!this.pipe) return;
		this.pipe.playWaterFlow();
	}

	checkPositionMatch({gridColumn, gridRow}: CellConfig) {
		return this.config.gridColumn === gridColumn && this.config.gridRow === gridRow;
	}

	reset() {
		this.onpointerdown = null;
		this.removePipe();
		this.unblock();
		this.setActive(false);
		this.setStart(false);
	}
}
