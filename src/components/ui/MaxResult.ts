import {Container, Text, TextStyle} from "pixi.js";

export class MaxResult extends Container {
	private _value: number = 0;
	private _valueLabel: Text;

	constructor() {
		super();

		this._valueLabel = this.createLabel();
		this.addChild(this._valueLabel);
	}

	createLabel() {
		const label = new Text({
			// text: "\u21BA",
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

	formatLabel(value: number) {
		return `Max: ${value}`;
	}

	updateValue(value: number) {
		this._valueLabel.text = this.formatLabel(value);
	}

	relayout() {}
}
