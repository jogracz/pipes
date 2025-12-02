import {Container, Text, TextStyle} from "pixi.js";

interface TimerConfig {
	defaultValue: number;
}

export class Timer extends Container {
	private _config: TimerConfig;
	private _timeLabel: Text;
	private _value: number;

	constructor(config: TimerConfig) {
		super();

		this._config = config;

		this._value = this._config.defaultValue;
		this._timeLabel = this.createLabel();

		this.addChild(this._timeLabel);
	}

	createLabel() {
		const label = new Text({
			text: this.formatLabel(this._value),
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
		this._value = this._value - intervalDelay;
		this._timeLabel.text = this.formatLabel(this._value);
		if (this._value < intervalDelay) {
			this.stop();
			stopCallBack();
		}
	}

	stop() {
		this._value = 0;
		this._timeLabel.text = this.formatLabel(this._value);
	}

	private formatLabel(valueInMs: number): string {
		const date = new Date(valueInMs);
		return `Time: ${date.getSeconds()}:${date.getMilliseconds() / 100}`;
	}

	reset() {
		this._value = this._config.defaultValue;
	}

	relayout() {}
}
