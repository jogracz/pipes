import { Assets, Container, Spritesheet, Text, TextStyle } from "pixi.js";
import { pipesAtlas, pipes_spritesheet, menu, button } from "../assets";
import { Grid } from "./grid";
import { RandomPipeGenerator, PipeQueue, Pipe } from "./pipes";
import { Menu } from "./ui";

const PIPE_QUEUE_LENGHT = 7;

export class GameScene extends Container {
    private _isLoaded = false;
    private _loader: Text;
    private menu: Menu;
    private pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
    private pipeQueue: PipeQueue;
    private grid: Grid;
    private startPipe: Pipe;
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
            this.relayout();
        });
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
        loader.x = window.innerWidth / 2;
        loader.y = window.innerHeight / 2;
        loader.anchor.set(0.5);
        return loader;
    }

    async load() {
        await Assets.load({ alias: "button", src: button });
        await Assets.load({ alias: "menu", src: menu });
        const pipeTexture = await Assets.load(pipes_spritesheet);
        this.pipesSpritesheet = new Spritesheet(pipeTexture, pipesAtlas);
        await this.pipesSpritesheet.parse();

        this._isLoaded = true;
        this.removeChild(this._loader);
    }

    mountComponents() {
        this.mountMenu();
        this.mountPipeQueue();
        this.mountGrid();
        this.mountStartPipe();
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
        this.pipeQueue.visible = false;
        this.addChild(this.pipeQueue);
    }

    mountGrid() {
        this.grid = new Grid({
            columnsCount: 9,
            rowsCount: 7,
            blockersCount: 5,
        });
        this.grid.x = 50;
        this.grid.visible = false;
        this.addChild(this.grid);
    }

    mountStartPipe() {
        this.startPipe = new Pipe({
            texture: this.pipesSpritesheet.textures.start,
            rotation: 0,
        });
        this.startPipe.visible = false;
    }

    mountMenu() {
        this.menu = new Menu();
        this.addChild(this.menu);
    }

    get isLoaded() {
        return this._isLoaded;
    }

    activateBoard() {
        this.grid.activate();
        this.pipeQueue.activate();
    }

    showBoard() {
        this.grid.visible = true;
        this.pipeQueue.visible = true;
    }

    get components() {
        return {
            menu: this.menu,
            grid: this.grid,
            pipeQueue: this.pipeQueue,
        };
    }

    async update() {
        if (this.isLoaded) {
            // this._sprite.x += 1;
            this.pipeQueue.update();
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
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;

        Object.values(this.components).forEach((component) =>
            component.relayout()
        );
        this.pipeQueue.x = this.pipeQueue.x + this.grid.x - 20;
    }

    reset() {
        this.grid.reset(this.startPipe);
        this.pipeQueue.reset();
    }
}
