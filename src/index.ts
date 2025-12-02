import "./style.css";
import {Application} from "pixi.js";
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import {GameController} from "./controller";
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

	const gameController = new GameController(config);

	pixiApp.stage.addChild(gameController.gameScene);
	window.addEventListener("resize", () => gameController.gameScene.relayout());

	pixiApp.ticker.add(() => {
		gameController.update();
	});

	await gameController.loadAssets();
	await gameController.prepareGame();
	await gameController.startGame();
})();
