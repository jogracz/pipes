import {Container, Text, TextStyle} from "pixi.js";

interface TimerConfig {
	defaultValue: number;
}

export class Timer extends Container {
	private _config: TimerConfig;
	private timeLabel: Text;
	private value: number;

	constructor(config: TimerConfig) {
		super();

		this._config = config;

		this.value = this._config.defaultValue;
		this.timeLabel = this.createLabel();

		this.addChild(this.timeLabel);
	}

	createLabel() {
		const label = new Text({
			text: this.formatLabel(this.value),
			style: new TextStyle({
				align: "left",
				fontSize: 28,
				fill: "#ffffff",
				stroke: "#aaaaaa",
			}),
		});
		label.alpha = 0.9;
		label.anchor.set(0.5);

		return label;
	}

	updateTime(intervalDelay: number, stopCallBack: () => void) {
		this.value = this.value - intervalDelay;
		this.timeLabel.text = this.formatLabel(this.value);
		if (this.value < intervalDelay) {
			this.stop();
			stopCallBack();
		}
	}

	stop() {
		this.value = 0;
		this.timeLabel.text = this.formatLabel(this.value);
	}

	private formatLabel(valueInMs: number): string {
		const date = new Date(valueInMs);
		return `Time: ${date.getSeconds()}:${date.getMilliseconds() / 100}`;
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
		this.value = this._config.defaultValue;
	}

	relayout() {}
}
