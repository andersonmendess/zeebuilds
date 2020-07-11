const buildsNode = document.getElementById("builds");
const buildMock = document.getElementById("build-mocked");

const expand = (Element) => {
    const expandable = Element.children[1];
    expandable.style.display = expandable.style.display === "none" ? "block" : "none"
}


let newBuild = buildMock;
newBuild.removeAttribute("id")

buildsNode.appendChild(newBuild.cloneNode(true))
