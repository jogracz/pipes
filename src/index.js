import "./style.css";

console.log("HELLO");
function component() {
    const element = document.createElement("div");

    element.innerHTML = "Hello Webpack";

    return element;
}

document.body.appendChild(component());
