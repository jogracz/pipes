import "./style.css";
import { Application, Ticker } from "pixi.js";
import { GameScene } from "./components";

(async () => {
    const app = new Application();
    await app.init({ background: "#1099bb", resizeTo: window });

    document.body.appendChild(app.canvas);

    const gameScene = new GameScene();

    app.stage.addChild(gameScene);

    app.ticker.add((ticker: Ticker) => {
        gameScene.update();
    });
})();
