import "./style.css";
import { Application, Ticker } from "pixi.js";
import { GameScene } from "./components";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(PixiPlugin);

(async () => {
    const app = new Application();
    await app.init({
        background: "#1099bb",
        resizeTo: window,
    });

    document.body.appendChild(app.canvas);

    const gameScene = new GameScene();

    app.stage.addChild(gameScene);
    window.addEventListener("resize", gameScene.relayout);

    app.ticker.add((ticker: Ticker) => {
        gameScene.update();
    });
})();
