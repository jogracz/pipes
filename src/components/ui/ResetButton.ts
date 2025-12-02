import gsap from "gsap/all";
import {Assets, Container, Sprite, Text, TextStyle} from "pixi.js";

export class ResetButton extends Container {
	private _onRestart: () => void;
	private icon: Text;

	constructor(onRestart: () => void) {
		super();

		this._onRestart = onRestart;

		this.icon = this.createLabel();
		this.addChild(this.icon);

		this.eventMode = "static";
		this.cursor = "pointer";
		this.onpointerover = () => this.onHover();
		this.onpointerout = () => this.onHoverEnd();
		this.onpointerdown = () => this.onClick();
	}

	createLabel() {
		const label = new Text({
			text: "\u21BA",
			style: new TextStyle({
				align: "left",
				fontSize: 45,
				fill: "#ffffff",
				stroke: "#aaaaaa",
			}),
		});
		label.alpha = 0.9;
		label.anchor.set(0.5);

		return label;
	}
	private async onHover() {
		// Add stoping animation(timeline.to1)
		// if (this.isBlocked && !this._isActive) return;
		const vars = {
			scale: 1,
		};
		await gsap.to(vars, {
			scale: 0.9,
			onUpdate: () => {
				this.scale.set(vars.scale);
			},
			duration: 0.15,
		});
	}

	private async onHoverEnd() {
		// if (this.isBlocked && !this._isActive) return;

		const vars = {
			scale: 0.95,
		};

		await gsap.to(vars, {
			scale: 1,
			onUpdate: () => {
				this.scale.set(vars.scale);
			},
			duration: 0.15,
		});
	}

	onClick() {
		console.log("RESET CLICK");
		this._onRestart();
	}

	// async hide() {
	// 	await gsap.to(this, {
	// 		alpha: 0,
	// 		duration: 0.2,
	// 	});
	// 	this.visible = false;
	// }

	// async show() {
	// 	this.visible = true;
	// 	await gsap.to(this, {
	// 		alpha: 1,
	// 		duration: 0.2,
	// 	});
	// }

	reset() {
		// this.visible = true;
		// this.alpha = 1;
	}

	relayout() {}
}
