import {Assets, Container, Sprite, Spritesheet, Text, TextStyle, Texture} from "pixi.js";
import {pipesAtlas, pipes_spritesheet, menu, button, clouds} from "../assets";
import {Cell, CellConfig, Grid} from "./grid";
import {RandomPipeGenerator, PipeQueue, Pipe, DIRECTION} from "./pipes";
import {Menu, ResetButton, Timer} from "./ui";
import {Config} from "../mediator";

const PIPE_QUEUE_LENGHT = 7;
enum PIPE_TYPE {
	STRAIGHT,
	CURVED,
	CROSS,
}

const PIPE_DIRECTIONS = {
	[PIPE_TYPE.STRAIGHT]: [DIRECTION.NN, DIRECTION.SS],
	[PIPE_TYPE.CURVED]: [DIRECTION.SS, DIRECTION.EE],
	[PIPE_TYPE.CROSS]: [DIRECTION.NN, DIRECTION.SS, DIRECTION.EE, DIRECTION.WW],
};
export class GameScene extends Container {
	private _config: Config;
	private _bg: Sprite;
	private _isLoaded = false;
	private _loader: Text;
	private menu: Menu;
	private timer: Timer;
	private pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
	private pipeQueue: PipeQueue;
	private grid: Grid;
	private startPipe: Pipe;
	private resetButton: ResetButton;
	isStarted: boolean = false;

	private _randomPipeGenerator: RandomPipeGenerator;

	constructor(config: Config) {
		super();

		this._config = config;

		this._loader = this.createLoader();
		this.addChild(this._loader);

		this.load().then(() => {
			this._randomPipeGenerator = new RandomPipeGenerator(this.pipesSpritesheet);
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
		await Assets.load({alias: "cloudsBg", src: clouds});
		await Assets.load({alias: "button", src: button});
		await Assets.load({alias: "menu", src: menu});
		const pipeTexture = await Assets.load(pipes_spritesheet);
		this.pipesSpritesheet = new Spritesheet(pipeTexture, pipesAtlas);
		await this.pipesSpritesheet.parse();

		this._isLoaded = true;
		this.removeChild(this._loader);
	}

	mountComponents() {
		this.mountBackground();
		this.mountTimer();
		this.mountResetButton();
		this.mountMenu();
		this.mountPipeQueue();
		this.mountGrid();
		this.mountStartPipe();
	}

	mountBackground() {
		this._bg = Sprite.from(Texture.from(clouds));
		this._bg.anchor.set(0.5);
		this.addChild(this._bg);
	}

	mountPipeQueue() {
		this.pipeQueue = new PipeQueue(
			{length: this._config.pipeQueueLength},
			this._randomPipeGenerator
		);
		this.pipeQueue.visible = false;
		this.addChild(this.pipeQueue);
	}

	mountGrid() {
		this.grid = new Grid({
			columnsCount: this._config.grid.columns,
			rowsCount: this._config.grid.rows,
			blockersCount: this._config.grid.blockedCells,
		});
		this.grid.x = 50;
		this.grid.visible = false;
		this.addChild(this.grid);
	}

	mountStartPipe() {
		this.startPipe = new Pipe({
			texture: this.pipesSpritesheet.textures.start,
			rotation: 0,
			defaultDirections: PIPE_DIRECTIONS[PIPE_TYPE.STRAIGHT],
		});
		this.startPipe.visible = false;
	}

	mountMenu() {
		this.menu = new Menu({gameName: this._config.gameName});
		this.addChild(this.menu);
	}

	mountTimer() {
		this.timer = new Timer({defaultValue: this._config.waterStartDelayinMs});
		this.timer.x = -185;
		this.timer.y = -240;
		this.addChild(this.timer);
	}

	mountResetButton() {
		this.resetButton = new ResetButton();
		this.resetButton.x = 185;
		this.resetButton.y = -240;
		this.addChild(this.resetButton);
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
			timer: this.timer,
		};
	}

	async waitForMove(callback: (cel: Cell) => void) {
		await this.grid.waitForMove(callback);
	}

	getCurrentPipe(): Pipe {
		return this.pipeQueue.getCurrentPipe();
	}

	getStartCell(): Cell {
		return this.grid.startCell;
	}

	getActiveCells() {
		return this.grid.getActiveCells();
	}

	hasActiveCells() {
		return this.getActiveCells().length > 50;
	}

	getValidNeighbours(cell: Cell) {
		return this.grid.getValidNeighbours(cell);
	}

	async update() {
		if (this.isLoaded) {
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

		Object.values(this.components).forEach((component) => component.relayout());
		this.pipeQueue.x = this.pipeQueue.x + this.grid.x - 20;
	}

	reset() {
		this.grid.reset(this.startPipe);
		this.pipeQueue.reset();
	}
}
