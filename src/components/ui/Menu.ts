import gsap from "gsap/all";
import {Assets, Container, Sprite, Text, TextStyle} from "pixi.js";

interface MenuConfig {
	gameName: string;
}

export class Menu extends Container {
	private _config: MenuConfig;
	private _clickSound: Howl;
	private bg: Sprite;
	private gameName: Text;
	private button: Sprite;
	private buttonLabel: Text;

	constructor(config: MenuConfig, clickSound: Howl) {
		super();

		this._config = config;
		this._clickSound = clickSound;

		this.bg = this.createBackground();
		this.gameName = this.createGameNameLabel();

		this.button = this.createStartButton();

		this.addChild(this.bg);
		this.addChild(this.gameName);
		this.addChild(this.button);
	}

	createBackground() {
		const texture = Assets.get("menu");
		// fix pixel-art antialiasing
		texture.source.scaleMode = "nearest";
		const bg = Sprite.from(texture);
		bg.scale.set(7);
		bg.anchor.set(0.5);

		// const gameNameLabel = new Text({
		// 	text: this._config.gameName,
		// 	style: new TextStyle({
		// 		fontSize: 60,
		// 		fill: "#dfe8e9ff",
		// 		stroke: "#aaaaaa",
		// 		fontWeight: "bolder",
		// 	}),
		// });
		// gameNameLabel.anchor.set(0.5);
		// // gameNameLabel.y = -320;
		// bg.addChild(gameNameLabel);

		return bg;
	}

	createGameNameLabel() {
		const gameNameLabel = new Text({
			text: this._config.gameName,
			style: new TextStyle({
				fontSize: 40,
				fill: "#fffaf1ff",
				stroke: "#44444444",
				fontWeight: "bolder",
			}),
		});
		gameNameLabel.anchor.set(0.5);
		gameNameLabel.x = 2;
		gameNameLabel.y = -240;

		return gameNameLabel;
	}

	createStartButton() {
		const texture = Assets.get("button");
		texture.source.scaleMode = "nearest";
		const button = Sprite.from(texture);

		button.scale.set(4);
		button.anchor.set(0.5);
		button.alpha = 0.9;
		button.eventMode = "static";

		button.on("pointerover", this.onHover);
		button.on("pointerout", this.onHoverEnd);

		return button;
	}

	async awaitStartClick() {
		await new Promise<void>((resolve) => {
			const onClick = () => {
				this._clickSound.play();
				resolve();
			};
			this.button.onpointerdown = onClick;
			this.button.cursor = "pointer";
		});
		this.button.onpointerdown = null;
		this.button.cursor = "arrow";
	}

	async onHover() {
		// if (this.isBlocked && !this._isActive) return;
		const vars = {
			scale: 4,
			alpha: 0.9,
		};
		await gsap.to(vars, {
			scale: 3.85,
			alpha: 1,
			onUpdate: () => {
				this.scale.set(vars.scale);
				this.alpha = vars.alpha;
			},
			duration: 0.1,
		});
	}

	async onHoverEnd() {
		// if (this.isBlocked && !this._isActive) return;

		const vars = {
			scale: 3.85,
			alpha: 1,
		};

		await gsap.to(vars, {
			scale: 4,
			alpha: 0.9,
			onUpdate: () => {
				this.scale.set(vars.scale);
				this.alpha = vars.alpha;
			},
			duration: 0.15,
		});
	}

	async hide() {
		await gsap.to(this, {
			alpha: 0,
			duration: 0.2,
		});
		this.visible = false;
	}

	async show() {
		this.visible = true;
		await gsap.to(this, {
			alpha: 1,
			duration: 0.2,
		});
	}

	reset() {
		this.visible = true;
		this.alpha = 1;
	}

	relayout() {
		this.x = -40;
	}
}
