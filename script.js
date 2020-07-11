const buildsNode = document.getElementById("builds");
const buildMock = document.getElementById("build-mocked");

const expand = (Element) => {
    const expandable = Element.parentNode.children[1];
    expandable.style.display = expandable.style.display === "none" ? "block" : "none"
}

const fetchReleases = async () => {
    const res = await fetch("https://api.github.com/repos/zeelog/OTA/releases");

    if(res.status != 200){
        alert("Failed to load Resources")
        return
    }

    return await res.json();
}

const formatDate = (dateString) => {
    const date = new Date(dateString);

    const d = date.getDate();
    const m = date.getMonth() + 1; //Month from 0 to 11
    const y = date.getFullYear();

    return `${date.getFullYear()}/${(m<=9 ? '0' + m : m)}/${(d <= 9 ? '0' + d : d)}`
}

const humanSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
  };


fetchReleases().then(res => drawList(res));

const drawList = (builds) => {

    builds.forEach(build => {

        const buildEl = buildMock.cloneNode(true);
        buildEl.removeAttribute("id");

        const nodes = {
            name: buildEl.children[0],
            tag: buildEl.children[1].getElementsByClassName("tag")[0].children[0],
            size: buildEl.children[1].getElementsByClassName("size")[0].children[0],
            date: buildEl.children[1].getElementsByClassName("date")[0].children[0],
            downloads: buildEl.children[1].getElementsByClassName("downloads")[0].children[0],
            changelog: buildEl.children[1].getElementsByClassName("changelog")[0].children[0],
            button: buildEl.children[1].getElementsByClassName("downloadbtn")[0]
        }

        nodes.button.addEventListener("click", function(){
            window.location = build.assets[0].browser_download_url
        });

        nodes.name.innerText = build.assets[0].name
        nodes.tag.innerText = build.tag_name
        nodes.size.innerText = humanSize(build.assets[0].size)
        nodes.downloads.innerText = build.assets[0].download_count;
        nodes.date.innerText = formatDate(build.assets[0].created_at)
        nodes.changelog.innerText = build.body


        buildsNode.appendChild(buildEl);
    });
}
