import gsap from "gsap";
import {Container, Sprite, Texture} from "pixi.js";

export enum DIRECTION {
	NN = "NN",
	EE = "EE",
	SS = "SS",
	WW = "WW",
}

export const ROTATIONS = [0, 90, 180, 270];
interface PipeConfig {
	texture: Texture;
	rotation: number;
	defaultDirections: DIRECTION[];
	textureFilled?: Texture;
}

export class Pipe extends Container {
	static spriteHeight = 32;
	private _id: number;
	private _config: PipeConfig;
	private _spriteDefault: Sprite;
	private _spriteFilled: Sprite;
	private _isActive: boolean = false;
	private _isFilled: boolean = false;

	private _isGrowing: boolean = false;

	constructor(config: PipeConfig) {
		super();

		this._config = config;

		this._spriteDefault = Sprite.from(this._config.texture);
		this._spriteDefault.anchor.set(0.5);

		if (this._config.textureFilled) {
			this._spriteFilled = Sprite.from(this._config.textureFilled);
			this._spriteFilled.anchor.set(0.5);
			this._spriteFilled.alpha = 0;
			this.addChild(this._spriteFilled);
		}

		this.angle = this._config.rotation;

		this.addChild(this._spriteDefault);
	}

	setActive(value: boolean) {
		this._isActive = value;
		if (value) {
			this._isGrowing = true;
		} else {
			this._isGrowing = false;
			this.scale.set(1);
		}
	}

	get isActive() {
		return this._isActive;
	}

	get isFilled() {
		return this._isFilled;
	}

	animateActive() {
		if (this._isGrowing) {
			if (this.scale.x < 1.1) {
				this.scale.set(this.scale.x + 0.008);
			} else {
				this._isGrowing = false;
			}
		} else {
			if (this.scale.x > 0.9) {
				this.scale.set(this.scale.x - 0.008);
			} else {
				this._isGrowing = true;
			}
		}
	}

	getConnectionDirections(): DIRECTION[] {
		return this._config.defaultDirections.map((direction: DIRECTION) =>
			this.getDirectionForRotation(direction, this._config.rotation)
		);
	}

	getDirectionForRotation(direction: DIRECTION, rotation: number): DIRECTION {
		if (rotation === 0) {
			return direction;
		}

		const directionsClockWise = [DIRECTION.NN, DIRECTION.EE, DIRECTION.SS, DIRECTION.WW];
		const directionIndex = directionsClockWise.indexOf(direction);
		const newIndex = directionIndex + rotation / 90;
		const maxIndex = directionsClockWise.length - 1;

		return directionsClockWise[
			newIndex > maxIndex ? newIndex - directionsClockWise.length : newIndex
		];
	}

	async playWaterFlow() {
		if (!this._spriteFilled) return;

		const duration = 0.5;
		this._isFilled = true;
		await Promise.all([
			gsap.to(this._spriteDefault, {alpha: 0, duration}),
			gsap.to(this._spriteFilled, {alpha: 1, duration}),
		]);
	}

	update() {
		if (this._isActive) {
			this.animateActive();
		}
	}

	reset() {
		this.setActive(false);
		this._spriteDefault.alpha = 1;
		this._spriteFilled.alpha = 0;
	}
}
