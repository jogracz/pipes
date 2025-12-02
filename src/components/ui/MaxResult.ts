import {Container, Text, TextStyle} from "pixi.js";

export class MaxResult extends Container {
	private value: number = 0;
	private valueLabel: Text;

	constructor() {
		super();

		this.valueLabel = this.createLabel();
		this.addChild(this.valueLabel);
	}

	createLabel() {
		const label = new Text({
			// text: "\u21BA",
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

	formatLabel(value: number) {
		return `Max: ${value}`;
	}

	updateValue(value: number) {
		this.valueLabel.text = this.formatLabel(value);
	}

	relayout() {}
}
