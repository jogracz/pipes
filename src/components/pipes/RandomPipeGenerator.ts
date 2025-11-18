import { Container, PipelineSystem, Sprite, Spritesheet } from "pixi.js";
import { pipesAtlas } from "../../assets";
import { getRandomElement } from "../../utils";
import { Pipe } from "./";

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
        const allRotations = [0, 90, 180, 360];
        // const allTypes = Object.keys(PIPE_TYPES);
        const allTextures = Object.values(this._pipesSpritesheet.textures);

        // const randomtype = getRandomElement(allTypes);
        const randomTexture = getRandomElement(allTextures);
        const randomRotation = getRandomElement(allRotations);
        return new Pipe({
            texture: randomTexture,
            rotation: randomRotation,
        });
    }

    // private generateStraightPipe() {
    //     const pipe = new Pipe();
    //     return pipe;
    // }
}
