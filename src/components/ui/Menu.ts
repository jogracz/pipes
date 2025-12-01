import gsap from "gsap/all";
import {Assets, Container, Sprite, Text, TextStyle} from "pixi.js";

interface MenuConfig {
	gameName: string;
}

export class Menu extends Container {
	private _config: MenuConfig;
	private _clickSound: Howl;
	private bg: Sprite;
	private button: Sprite;
	private buttonLabel: Text;

	constructor(config: MenuConfig, clickSound: Howl) {
		super();

		this._config = config;
		this._clickSound = clickSound;

		this.bg = this.createBackground();

		this.button = this.createStartButton();

		this.addChild(this.bg);
		this.addChild(this.button);

		this.scale.set(0.8);
	}

	createBackground() {
		const bg = Sprite.from(Assets.get("menu"));
		bg.anchor.set(0.5);

		const gameNameLabel = new Text({
			text: this._config.gameName,
			style: new TextStyle({
				fontSize: 60,
				fill: "#dfe8e9ff",
				stroke: "#aaaaaa",
				fontWeight: "bolder",
			}),
		});
		gameNameLabel.anchor.set(0.5);
		gameNameLabel.y = -320;
		bg.addChild(gameNameLabel);

		return bg;
	}

	createStartButton() {
		const button = Sprite.from(Assets.get("button"));
		button.anchor.set(0.5);
		button.eventMode = "static";

		const buttonLabel = new Text({
			text: "Start",
			style: new TextStyle({
				fontSize: 80,
				fill: "#ffffff",
				stroke: "#aaaaaa",
			}),
		});
		buttonLabel.anchor.set(0.5);
		button.addChild(buttonLabel);

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
			this.button.onclick = onClick;
			this.button.cursor = "pointer";
		});
		this.button.onclick = null;
		this.button.cursor = "arrow";
	}

	async onHover() {
		// if (this.isBlocked && !this._isActive) return;
		const vars = {
			scale: 1,
		};
		await gsap.to(vars, {
			scale: 0.98,
			onUpdate: () => {
				this.scale.set(vars.scale);
			},
			duration: 0.1,
		});
	}

	async onHoverEnd() {
		// if (this.isBlocked && !this._isActive) return;

		const vars = {
			scale: 0.98,
		};

		await gsap.to(vars, {
			scale: 1,
			onUpdate: () => {
				this.scale.set(vars.scale);
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

	relayout() {}
}
