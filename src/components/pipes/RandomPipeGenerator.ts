import {Container, PipelineSystem, Sprite, Spritesheet} from "pixi.js";
import {pipesAtlas} from "../../assets";
import {getRandomElement} from "../../utils";
import {Pipe} from "./";
import {DIRECTION, ROTATIONS} from "./Pipe";

export const PIPE_TEXTURES = {
	straight: "",
};

enum PIPE_TYPES {
	STRAIGHT = "STRAIGHT",
	CURVED = "CURVED",
	CROSS = "CROSS",
}

export class RandomPipeGenerator {
	private _isLoaded = false;
	private _loader: Text;
	private _pool: Pipe[]; //pool here or elsewhere?
	private _pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
	private pipeDictionary: any;
	// private _sprite: Sprite;

	constructor(pipesSpriteSheet: Spritesheet<typeof pipesAtlas>) {
		this._pipesSpritesheet = pipesSpriteSheet;

		this.pipeDictionary = {
			[PIPE_TYPES.STRAIGHT]: {
				texture: this._pipesSpritesheet.textures.straight,
				textureFilled: this._pipesSpritesheet.textures.straightFilled,
				defaultDirections: [DIRECTION.NN, DIRECTION.SS],
			},
			[PIPE_TYPES.CURVED]: {
				texture: this._pipesSpritesheet.textures.curved,
				textureFilled: this._pipesSpritesheet.textures.curvedFilled,
				defaultDirections: [DIRECTION.EE, DIRECTION.SS],
			},
			[PIPE_TYPES.CROSS]: {
				texture: this._pipesSpritesheet.textures.cross,
				textureFilled: this._pipesSpritesheet.textures.crossFilled,
				defaultDirections: [DIRECTION.NN, DIRECTION.EE, DIRECTION.SS, DIRECTION.WW],
			},
		};
	}

	generate(): Pipe {
		const randomType = getRandomElement(Object.keys(PIPE_TYPES));
		const randomRotation = getRandomElement(ROTATIONS);

		return new Pipe({
			texture: this.pipeDictionary[randomType].texture,
			textureFilled: this.pipeDictionary[randomType].textureFilled,
			rotation: randomRotation,
			defaultDirections: this.pipeDictionary[randomType].defaultDirections,
		});
	}
}
