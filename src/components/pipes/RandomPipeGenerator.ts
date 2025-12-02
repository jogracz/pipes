import {Spritesheet} from "pixi.js";
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
	private _pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
	private _pipeDictionary: any;

	constructor(pipesSpriteSheet: Spritesheet<typeof pipesAtlas>) {
		this._pipesSpritesheet = pipesSpriteSheet;

		this._pipeDictionary = {
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
			texture: this._pipeDictionary[randomType].texture,
			textureFilled: this._pipeDictionary[randomType].textureFilled,
			rotation: randomRotation,
			defaultDirections: this._pipeDictionary[randomType].defaultDirections,
		});
	}
}
