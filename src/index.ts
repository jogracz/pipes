import "./style.css";
import { Application, Assets, Container, Sprite } from "pixi.js";

console.log("HELLO");
function component() {
    const element = document.createElement("div");

    element.innerHTML = "Hello Webpack";

    return element;
}

document.body.appendChild(component());

const app = new Application();
app.init({ background: "#1099bb", resizeTo: window });

window.onload = async () => {
    document.body.appendChild(app.canvas);
};

const container = new Container();

app.stage.addChild(container);

app.ticker.add(() => {
    // game.update();
});
