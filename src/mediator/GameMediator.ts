import { pipe } from "gsap/all";
import { GameScene } from "../components";

export class GameMediator {
    private _gameScene: GameScene;

    constructor() {
        this._gameScene = new GameScene();
    }

    get gameScene() {
        return this._gameScene;
    }

    update() {
        this._gameScene.update();
    }
}
