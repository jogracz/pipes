import { GameScene } from "../components";

export class GameMediator {
    private _gameScene: GameScene;

    constructor() {
        this._gameScene = new GameScene();
    }

    async loadAssets() {
        await this.gameScene.load();
    }

    async startGame() {
        await this.gameScene.components.menu.awaitClick();
        this.gameScene.showBoard();
        await this.gameScene.components.menu.hide();
    }

    get gameScene() {
        return this._gameScene;
    }

    update() {
        this._gameScene.update();
    }
}
