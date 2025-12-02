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
	private _menu: Menu;
	private _timer: Timer;
	private _pipesSpritesheet: Spritesheet<typeof pipesAtlas>;
	private _pipeQueue: PipeQueue;
	private _grid: Grid;
	private _startPipe: Pipe;
	private _maxResult: MaxResult;
	private _resetButton: ResetButton;
	private _sounds: GameSounds;

	private _randomPipeGenerator: RandomPipeGenerator;

	constructor(config: Config, onRestart: () => void) {
		super();

		this._config = config;
		this._onRestart = onRestart;

		this._loader = this.createLoader();
		this.addChild(this._loader);

		this.load().then(() => {
			this._randomPipeGenerator = new RandomPipeGenerator(this._pipesSpritesheet);
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
		this._pipesSpritesheet = new Spritesheet(pipeTexture, pipesAtlas);
		await this._pipesSpritesheet.parse();

		this._isLoaded = true;
		this.removeChild(this._loader);
	}

	mountSounds() {
		this._sounds = {
			click: new Howl({src: sounds.clickSound}),
			bgMusic: new Howl({src: sounds.bgMusic}),
			finish: new Howl({src: sounds.finishSound}),
			water: new Howl({src: sounds.waterSound}),
		};
	}

	playBgMusic() {
		this._sounds.bgMusic.volume(0);
		this._sounds.bgMusic.loop();
		this._sounds.bgMusic.play();
		this._sounds.bgMusic.fade(0, 0.5, 2000);
	}

	playWaterSound() {
		this._sounds.water.volume(0.6);
		this._sounds.water.play();
	}

	playClickSound() {
		this._sounds.click.volume(0.7);
		this._sounds.click.play();
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
		this._pipeQueue = new PipeQueue(
			{length: this._config.pipeQueueLength},
			this._randomPipeGenerator
		);
		this._pipeQueue.visible = false;
		this.addChild(this._pipeQueue);
	}

	mountGrid() {
		this._grid = new Grid(
			{
				columnsCount: this._config.grid.columns,
				rowsCount: this._config.grid.rows,
				blockersCount: this._config.grid.blockedCells,
			},
			this._sounds.click
		);
		this._grid.x = 50;
		this._grid.visible = false;
		this.addChild(this._grid);
	}

	mountStartPipe() {
		this._startPipe = new Pipe({
			texture: this._pipesSpritesheet.textures.start,
			rotation: 0,
			defaultDirections: PIPE_DIRECTIONS[PIPE_TYPE.STRAIGHT],
		});
		this._startPipe.visible = false;
	}

	mountMenu() {
		this._menu = new Menu({gameName: this._config.gameName}, this._sounds.click);
		this.addChild(this._menu);
	}

	mountTimer() {
		this._timer = new Timer({defaultValue: this._config.waterStartDelayinMs});
		this._timer.x = -185;
		this._timer.y = -240;
		this._timer.visible = false;
		this.addChild(this._timer);
	}

	mountMaxResult() {
		this._maxResult = new MaxResult();
		this._maxResult.x = 155;
		this._maxResult.y = -240;
		this._maxResult.visible = false;
		this.addChild(this._maxResult);
	}

	mountResetButtont() {
		this._resetButton = new ResetButton(() => this._onRestart());
		this._resetButton.x = -24;
		this._resetButton.y = -240;
		this._resetButton.visible = false;
		this.addChild(this._resetButton);
	}

	updateMaxResult(value: number) {
		this._maxResult.updateValue(value);
	}

	async awaitStartClick() {
		await this._menu.awaitStartClick();
	}

	get isLoaded() {
		return this._isLoaded;
	}

	get isActive() {
		return this._isActive;
	}

	activateBoard() {
		this._isActive = true;
		this._grid.activate();
		this._pipeQueue.activate();

		this.lightsOn();
	}

	deactivateBoard() {
		this._isActive = false;
		this._grid.deactivate();
		this._pipeQueue.deactivate();
	}

	showBoard() {
		this._grid.visible = true;
		this._pipeQueue.visible = true;
		this._timer.visible = true;
		this._maxResult.visible = true;
		this._resetButton.visible = true;
	}

	get components() {
		return {
			menu: this._menu,
			grid: this._grid,
			pipeQueue: this._pipeQueue,
			timer: this._timer,
			maxResult: this._maxResult,
			resetButton: this._resetButton,
		};
	}

	async waitForMove(callback: (cel: Cell) => void) {
		await this._grid.waitForMove(callback);
	}

	getCurrentPipe(): Pipe {
		return this._pipeQueue.getCurrentPipe();
	}

	getStartCell(): Cell {
		return this._grid.startCell;
	}

	getActiveCells() {
		return this._grid.getActiveCells();
	}

	hasActiveCells() {
		return this.getActiveCells().length > 0;
	}

	getValidNeighbours(cell: Cell) {
		return this._grid.getValidNeighbours(cell);
	}

	async finish() {
		this._sounds.finish.play();
		await this.lightsOff();
		this._resetButton.alpha = 1;
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
			this._pipeQueue.update();
		}
	}

	reset() {
		this._grid.reset(this._startPipe);
		this._pipeQueue.reset();
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
		this._pipeQueue.x = this._pipeQueue.x + this._grid.x - 20;
	}
}
