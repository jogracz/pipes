import "./style.css";
import {Application, Ticker} from "pixi.js";
import {GameScene} from "./components";
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {GameMediator} from "./controller";
import config from "./config.json";

gsap.registerPlugin(PixiPlugin);

(async () => {
	// INITIATE PIXI APP
	const pixiApp = new Application();
	await pixiApp.init({
		resizeTo: window,
		antialias: false,
	});
	document.body.appendChild(pixiApp.canvas);

	const gameMediator = new GameMediator(config);

	pixiApp.stage.addChild(gameMediator.gameScene);
	window.addEventListener("resize", () => gameMediator.gameScene.relayout());

	pixiApp.ticker.add(() => {
		gameMediator.update();
	});

	await gameMediator.loadAssets();
	await gameMediator.startGame();
})();
