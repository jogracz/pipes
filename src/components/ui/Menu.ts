import gsap from "gsap/all";
import { Assets, Container, Sprite, Text, TextStyle } from "pixi.js";

export class Menu extends Container {
    private bg: Sprite;
    private button: Sprite;
    private buttonLabel: Text;

    constructor() {
        super();
        this.bg = Sprite.from(Assets.get("menu"));
        this.bg.anchor.set(0.5);

        this.button = Sprite.from(Assets.get("button"));
        this.button.anchor.set(0.5);
        this.button.eventMode = "static";
        this.buttonLabel = new Text({
            text: "Start",
            style: new TextStyle({
                fontSize: 80,
                fill: "#ffffff",
                stroke: "#aaaaaa",
            }),
        });
        this.buttonLabel.anchor.set(0.5);

        this.addChild(this.bg);
        this.addChild(this.button);
        this.button.addChild(this.buttonLabel);

        this.button.on("pointerover", this.onHover);
        this.button.on("pointerout", this.onHoverEnd);
    }

    async awaitStartClick() {
        await new Promise<void>((resolve) => {
            const onClick = () => {
                console.log("!");
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
