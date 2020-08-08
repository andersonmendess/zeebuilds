const buildsNode = document.getElementById("builds");
const buildMock = document.getElementById("build-mocked");

const state = {
  builds: [],
  target: "3.18"
}

const expand = (Element) => {
  const expandable = Element.parentNode.children[1];
  const state = expandable.style.maxHeight !== "400px";
  expandable.style.maxHeight = state ? "400px" : "0px";
  expandable.style.padding = state ? "10px" : "0px";
  rotateArrow(Element.lastElementChild, state);
};

const rotateArrow = (Element, state) => {
  Element.style.transform = state ? "rotate(180deg)" : "rotate(0deg)";
};

const fetchJSON = async (url) => {
  const res = await fetch(url);

  if (res.status != 200) {
    alert("Failed to load Resources");
    return;
  }

  return res.json();
};

fetchJSON("https://api.opengapps.org/list").then((res) => {
  const select = buildMock.getElementsByClassName("gapps")[0];

  const variants = res.archs.arm64.apis["10.0"].variants;

  variants.forEach((variant) => {
    let option = document.createElement("option");
    option.text = `OpenGapps ${variant.name}`;
    option.value = variant.zip;
    select.appendChild(option);
  });

  if(state.builds.length){
    drawList(state);
  }
});

const downloadUtils = {
  generateDownloadLink: (base) =>
    `${base}?r=&ts=${downloadUtils.timestamp()}&use_mirror=autoselect`,
  timestamp: () => {
    const d = new Date();
    return Math.floor(d.getTime() / 1000);
  },
};

const calcNewestDays = (dateString) => {
  const buildDate = new Date(dateString);
  const today = new Date();
  const diff = today.getTime() - buildDate.getTime();
  return Math.round(diff / (1000 * 3600 * 24)); 
}

const formatters = {
  date: (dateString) => {
    const date = new Date(dateString);

    const d = date.getDate();
    const m = date.getMonth() + 1; //Month from 0 to 11
    const y = date.getFullYear();

    return `${date.getFullYear()}/${m <= 9 ? "0" + m : m}/${
      d <= 9 ? "0" + d : d
    }`;
  },
  size: (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
  },
};

fetchJSON("https://api.github.com/repos/zeelog/OTA/releases").then((res) => {
  state.builds = res;
  drawList(state)

  const getLast = (target) => res.filter(build => build.assets[0].name.includes(target))[0];

  const tabs = Array.from(document.getElementsByClassName("tab"));

  tabs.forEach((tab) => {

    const latest = getLast(tab.dataset.target);
    const daysSince = calcNewestDays(latest.assets[0].created_at)

    if(!isNaN(daysSince)){
      let text = "";

      if(daysSince === 0){
        text = "Today" 
      } else {
        text = `${daysSince} ${daysSince > 1 ? "days" : "day"} ago`
      }

      tab.children.innerText = `${daysSince}`
      const span = document.createElement("span");
      span.classList.add("updated");
      span.innerHTML = text;

      tab.appendChild(span)
    }

    tab.addEventListener("click", function(){
      tabs.forEach(tab => tab.classList.remove("active"));
      state.target = this.dataset.target;
      drawList(state);
      this.classList.add("active")
    });
  })
});

const backgroundDownloader = (url) => {
  const frame = document.createElement("frame");
  frame.src = url
  frame.style.display = "none";

  buildsNode.appendChild(frame)
}

const buildFactory = (baseElement) => {
  const Element = baseElement.cloneNode(true);

  const show = () => Element.removeAttribute("id");

  const nodes = {
    name: Element.children[0].getElementsByClassName("name")[0],
    tag: Element.children[1].getElementsByClassName("tag")[0].children[0],
    size: Element.children[1].getElementsByClassName("size")[0].children[0],
    date: Element.children[1].getElementsByClassName("date")[0].children[0],
    downloads: Element.children[1].getElementsByClassName("downloads")[0].children[0],
    changelog: Element.children[1].getElementsByClassName("changelog")[0].children[0],
    button: Element.children[1].getElementsByClassName("downloadbtn")[0],
    option: Element.children[1].getElementsByClassName("gapps")[0]
  }

  const set = {
    name: (name) => { nodes.name.innerText = name },
    tag: (tag) => { nodes.tag.innerText = tag },
    size: (size) => { nodes.size.innerText = size },
    date: (date) => { nodes.date.innerText = date },
    downloads: (downloads) => { nodes.downloads.innerText = downloads },
    changelog: (changelog) => { nodes.changelog.innerText = changelog },
    button: (button) => { nodes.button.innerText = button }
  }

  const elements = {
    arrowIcon: Element.firstElementChild.childNodes[3],
    container: Element.lastChild.previousElementSibling,
  }

  return {
    Element,
    show,
    nodes,
    set,
    elements,
  }
}

const drawList = ({builds, target}) => {

  buildsNode.innerHTML = "";

  builds = builds.filter((build) => {
    return build.assets[0].name.includes(target)
  });

  builds.forEach((buildData, index) => {

    const { name, size, download_count: downloads, 
      created_at: date, browser_download_url: url } = buildData.assets[0];
    const { tag_name: tag, body: changelog } = buildData;

    const build = buildFactory(buildMock);

    build.nodes.button.addEventListener("click", function () {
      const gapps = build.nodes.option.value;

      if (url) backgroundDownloader(url)
      if (gapps) backgroundDownloader(downloadUtils.generateDownloadLink(gapps))

    });
    
    const reversedIndex = builds.length - index;

    build.set.name(name);
    build.set.tag(`#${reversedIndex}`);
    build.set.size(formatters.size(size));
    build.set.downloads(downloads);
    build.set.date(formatters.date(date));
    build.set.changelog(changelog);

    if (index === 0) {
      build.elements.container.style.maxHeight = "400px";
      build.elements.container.style.padding = "10px";
      rotateArrow(build.elements.arrowIcon, true);
    }

    build.show();
    buildsNode.appendChild(build.Element);
  });
};
