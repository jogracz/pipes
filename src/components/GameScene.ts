import {Assets, Container, Sprite, Spritesheet, Text, TextStyle, Texture} from "pixi.js";
import {Howl} from "howler";
import {pipesAtlas, pipesSpritesheet, menu, button, clouds, sounds} from "../assets";
import {Cell, Grid} from "./grid";
import {RandomPipeGenerator, PipeQueue, Pipe, DIRECTION} from "./pipes";
import {Menu, ResetButton, Timer} from "./ui";
import {Config} from "../controller";

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

export type GameSounds = {
	bgMusic: Howl;
	click: Howl;
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
	private sounds: GameSounds;
	isStarted: boolean = false;

	private _randomPipeGenerator: RandomPipeGenerator;

	constructor(config: Config) {
		super();

		this._config = config;

		this._loader = this.createLoader();
		this.addChild(this._loader);

		this.load().then(() => {
			this._randomPipeGenerator = new RandomPipeGenerator(this.pipesSpritesheet);
			this.mountSounds();
			this.mountComponents();
			this.playBgMusic();
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
		// await Assets.load({alias: "sounds", src: sounds});

		const pipeTexture = await Assets.load(pipesSpritesheet);
		this.pipesSpritesheet = new Spritesheet(pipeTexture, pipesAtlas);
		await this.pipesSpritesheet.parse();

		this._isLoaded = true;
		this.removeChild(this._loader);
	}

	mountSounds() {
		this.sounds = {
			click: new Howl({src: sounds.clickSound}),
			bgMusic: new Howl({src: sounds.bgMusic}),
			// won: new Howl({src: sounds.wonSoundUrl}),
		};
	}

	playBgMusic() {
		this.sounds.bgMusic.volume(0);
		this.sounds.bgMusic.play();
		this.sounds.bgMusic.loop();
		this.sounds.bgMusic.fade(0, 0.5, 2000);
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
		this.grid = new Grid(
			{
				columnsCount: this._config.grid.columns,
				rowsCount: this._config.grid.rows,
				blockersCount: this._config.grid.blockedCells,
			},
			this.sounds.click
		);
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
		this.menu = new Menu({gameName: this._config.gameName}, this.sounds.click);
		this.addChild(this.menu);
	}

	mountTimer() {
		this.timer = new Timer({defaultValue: this._config.waterStartDelayinMs});
		this.timer.x = -185;
		this.timer.y = -240;
		this.timer.visible = false;
		this.addChild(this.timer);
	}

	mountResetButton() {
		this.resetButton = new ResetButton();
		this.resetButton.x = 185;
		this.resetButton.y = -240;
		this.resetButton.visible = false;
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
		this.timer.visible = true;
		this.resetButton.visible = true;
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
