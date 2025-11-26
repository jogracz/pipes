import { Container, PipelineSystem, Sprite, Spritesheet } from "pixi.js";
import { pipesAtlas } from "../../assets";
import { getRandomElement } from "../../utils";
import { Pipe } from "./";
import { ROTATIONS } from "./Pipe";

export const PIPE_TEXTURES = {
    straight: "",
};

enum PIPE_TYPES {
    STRAIGHT,
    CURVED,
    CROSS,
}

export class RandomPipeGenerator {
    private _isLoaded = false;
    private _loader: Text;
    private _pool: Pipe[]; //pool here or elsewhere?
    private _pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
    // private _sprite: Sprite;

    constructor(pipesSpriteSheet: Spritesheet<typeof pipesAtlas>) {
        this._pipesSpritesheet = pipesSpriteSheet;
    }

    generate(): Pipe {
        const { straight, cross, curved } = this._pipesSpritesheet.textures;
        const allTextures = [straight, cross, curved];

        const randomTexture = getRandomElement(allTextures);
        const randomRotation = getRandomElement(ROTATIONS);
        return new Pipe({
            texture: randomTexture,
            rotation: randomRotation,
            defaultDirections: [],
        });
    }
}
