import {
    Assets,
    Container,
    Sprite,
    Spritesheet,
    Text,
    TextStyle,
} from "pixi.js";
import { pipesAtlas, pipes_spritesheet } from "../assets";
import { Grid } from "./grid";
import { RandomPipeGenerator } from "./pipes";
import { PipeQueue } from "./pipes/PipeQueue";

const PIPE_QUEUE_LENGHT = 7;

export class GameScene extends Container {
    private _isLoaded = false;
    private _loader: Text;
    private _sprite: Sprite;
    private _pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
    private _pipeQueue: PipeQueue;
    private grid: Grid;

    private _randomPipeGenerator: RandomPipeGenerator;

    constructor() {
        super();

        this._loader = this.createLoader();
        this.addChild(this._loader);

        this.load().then(() => {
            this._randomPipeGenerator = new RandomPipeGenerator(
                this._pipesSpritesheet
            );
            // this._pipeQueue = new PipeQueue({ length: PIPE_QUEUE_LENGHT });
            this.mountComponents();
        });
        this.relayout();
    }

    createLoader() {
        const loader = new Text();
        loader.style = new TextStyle({
            fontFamily: "Arial",
            fontSize: 82,
            fontWeight: "bold",
            fill: "#66CCCC",
        });
        loader.text = "Loading...";
        return loader;
    }

    async load() {
        const texture = await Assets.load(pipes_spritesheet);
        this._pipesSpritesheet = new Spritesheet(texture, pipesAtlas);
        await this._pipesSpritesheet.parse();

        this._isLoaded = true;
        this.removeChild(this._loader);

        // remove later:

        // const sprite = Sprite.from(this._pipesSpritesheet.textures.straight);
        // this.addChild(sprite);
        // this._sprite = sprite;
        //Add POOLING
    }

    mountComponents() {
        this.mountPipeQueue();
        this.mountGrid();
    }

    mountPipeQueue() {
        // const pipeQueueContainer = new Container();
        // const padding = 10;
        // for (let i = 0; i < PIPE_QUEUE_LENGHT; i++) {
        //     const pipe = this._randomPipeGenerator.generate();
        //     console.log(pipe);
        //     pipe.y = i * (pipe.height + padding);
        //     pipeQueueContainer.addChild(pipe);
        // }
        // this.addChild(pipeQueueContainer);
        this._pipeQueue = new PipeQueue(
            { length: PIPE_QUEUE_LENGHT },
            this._randomPipeGenerator
        );
        this.addChild(this._pipeQueue);
    }

    mountGrid() {
        this.grid = new Grid({ columns: 9, rows: 7 });
        this.grid.x = 50;
        this.addChild(this.grid);
    }

    get isLoaded() {
        return this._isLoaded;
    }

    async update() {
        if (this.isLoaded) {
            // this._sprite.x += 1;
        }
        // Load assets
        // Assets.add({
        //     alias: "atlas",
        //     src: "images/spritesheet.json",
        //     data: { imageFilename: "my-spritesheet.2x.avif" }, // using of custom filename located in "images/my-spritesheet.2x.avif"
        // });
        // const sheet = await Assets.load("atlas");
        // sheet.frame1
        // Mount components
        // Await user input
        // Play bg music
        // Play game
    }

    relayout() {
        this.x = 100;
        this.y = 100;
    }
}
