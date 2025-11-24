import "./style.css";
import { Application, Ticker } from "pixi.js";
import { GameScene } from "./components";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { GameMediator } from "./mediator";

gsap.registerPlugin(PixiPlugin);

(async () => {
    const pixiApp = new Application();
    await pixiApp.init({
        background: "#1099bb",
        resizeTo: window,
    });

    document.body.appendChild(pixiApp.canvas);

    // const gameScene = new GameScene();
    const gameMediator = new GameMediator();

    pixiApp.stage.addChild(gameMediator.gameScene);
    // window.addEventListener("resize", gameScene.relayout);

    pixiApp.ticker.add((ticker: Ticker) => {
        gameMediator.update();
    });

    await gameMediator.loadAssets();
    await gameMediator.startGame();
})();
