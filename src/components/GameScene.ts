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
    private pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
    private pipeQueue: PipeQueue;
    private grid: Grid;
    isStarted: boolean = false;

    private _randomPipeGenerator: RandomPipeGenerator;

    constructor() {
        super();

        this._loader = this.createLoader();
        this.addChild(this._loader);

        this.load().then(() => {
            this._randomPipeGenerator = new RandomPipeGenerator(
                this.pipesSpritesheet
            );
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
        this.pipesSpritesheet = new Spritesheet(texture, pipesAtlas);
        await this.pipesSpritesheet.parse();

        this._isLoaded = true;
        this.removeChild(this._loader);
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
        this.pipeQueue = new PipeQueue(
            { length: PIPE_QUEUE_LENGHT },
            this._randomPipeGenerator
        );
        this.addChild(this.pipeQueue);
    }

    mountGrid() {
        this.grid = new Grid({
            columnsCount: 9,
            rowsCount: 7,
            blockersCount: 5,
        });
        this.grid.x = 50;
        this.addChild(this.grid);
    }

    get isLoaded() {
        return this._isLoaded;
    }

    gameStart() {
        this.grid.activate();
        this.pipeQueue.activate();
    }

    async update() {
        if (this.isLoaded) {
            // this._sprite.x += 1;
            this.pipeQueue.update();

            if (!this.isStarted) {
                this.isStarted = true;
                this.gameStart();
            }
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
