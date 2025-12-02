import {Assets, Container, Sprite, Spritesheet, Text, TextStyle, Texture} from "pixi.js";
import {Howl} from "howler";
import {pipesAtlas, pipesSpritesheet, menu, button, clouds, sounds} from "../assets";
import {Cell, Grid} from "./grid";
import {RandomPipeGenerator, PipeQueue, Pipe, DIRECTION} from "./pipes";
import {Menu, MaxResult, Timer, ResetButton} from "./ui";
import {Config} from "../controller";
import gsap from "gsap";

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
	water: Howl;
	finish: Howl;
};
export class GameScene extends Container {
	private _config: Config;
	private _onRestart: () => void;
	private _isActive: boolean = false;
	private _bg: Sprite;
	private _isLoaded = false;
	private _loader: Text;
	private menu: Menu;
	private timer: Timer;
	private pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
	private pipeQueue: PipeQueue;
	private grid: Grid;
	private startPipe: Pipe;
	private maxResult: MaxResult;
	private resetButton: ResetButton;
	private sounds: GameSounds;
	isStarted: boolean = false;

	private _randomPipeGenerator: RandomPipeGenerator;

	constructor(config: Config, onRestart: () => void) {
		super();

		this._config = config;
		this._onRestart = onRestart;

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
			finish: new Howl({src: sounds.finishSound}),
			water: new Howl({src: sounds.waterSound}),
		};
	}

	playBgMusic() {
		this.sounds.bgMusic.volume(0);
		this.sounds.bgMusic.play();
		this.sounds.bgMusic.loop();
		this.sounds.bgMusic.fade(0, 0.5, 2000);
	}

	playWaterSound() {
		this.sounds.water.volume(0.7);
		this.sounds.water.play();
	}

	mountComponents() {
		this.mountBackground();
		this.mountTimer();
		this.mountMaxResult();
		this.mountResetButtont();
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

	mountMaxResult() {
		this.maxResult = new MaxResult();
		this.maxResult.x = 155;
		this.maxResult.y = -240;
		this.maxResult.visible = false;
		this.addChild(this.maxResult);
	}

	mountResetButtont() {
		this.resetButton = new ResetButton(() => this._onRestart());
		this.resetButton.x = -24;
		this.resetButton.y = -240;
		this.resetButton.visible = false;
		this.addChild(this.resetButton);
	}

	updateMaxResult(value: number) {
		this.maxResult.updateValue(value);
	}

	async awaitStartClick() {
		await this.menu.awaitStartClick();
	}

	get isLoaded() {
		return this._isLoaded;
	}

	get isActive() {
		return this._isActive;
	}

	activateBoard() {
		this._isActive = true;
		this.grid.activate();
		this.pipeQueue.activate();

		this.lightsOn();
	}

	deactivateBoard() {
		this._isActive = false;
		this.grid.deactivate();
		this.pipeQueue.deactivate();
	}

	showBoard() {
		this.grid.visible = true;
		this.pipeQueue.visible = true;
		this.timer.visible = true;
		this.maxResult.visible = true;
		this.resetButton.visible = true;
	}

	get components() {
		return {
			menu: this.menu,
			grid: this.grid,
			pipeQueue: this.pipeQueue,
			timer: this.timer,
			maxResult: this.maxResult,
			resetButton: this.resetButton,
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

	async finish() {
		this.sounds.finish.play();
		await this.lightsOff();
		this.resetButton.alpha = 1;
	}

	async lightsOff() {
		await Promise.all(
			Object.values(this.components).map((component: Object) =>
				gsap.to(component, {alpha: 0.8, duration: 0.2})
			)
		);
	}

	async lightsOn() {
		await Promise.all(
			Object.values(this.components).map((component: Object) =>
				gsap.to(component, {alpha: 1, duration: 0.2})
			)
		);
	}

	async update() {
		if (this.isLoaded) {
			this.pipeQueue.update();
		}
	}

	reset() {
		this.grid.reset(this.startPipe);
		this.pipeQueue.reset();
		this.relayout();
	}

	relayout() {
		this.x = window.innerWidth / 2 + 30;
		this.y = window.innerHeight / 2;
		if (window.innerWidth < 500 || window.innerHeight < 500) {
			this.scale.set(0.6);
		} else {
			this.scale.set(1);
		}

		Object.values(this.components).forEach((component) => component.relayout());
		this.pipeQueue.x = this.pipeQueue.x + this.grid.x - 20;
	}
}
