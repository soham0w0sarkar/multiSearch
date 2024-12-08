let noOfScreen = 2;
let searchValue = "";

const searchEngines = [
  "https://www.perplexity.ai/search?q=",
  "https://www.google.com/search?q=",
  "https://www.reddit.com/search/?q=",
];

const logos = [
  "./icons/logo/perplexity.svg",
  "./icons/logo/google.svg",
  "./icons/logo/reddit.svg",
];

function savePresets() {
  const presets = {
    noOfScreens: noOfScreen,
    searchEngines: Array.from(document.querySelectorAll("select")).map(
      (select) => select.selectedIndex,
    ),
  };
  localStorage.setItem("multiSearchPresets", JSON.stringify(presets));
  console.log("Presets saved", presets);
}

function loadPresets() {
  chrome.storage.sync.get("newTabOverride", (data) => {
    document.getElementById("newTabSetting").checked =
      data.newTabOverride || false;
  });

  const savedPresets = localStorage.getItem("multiSearchPresets");
  if (savedPresets) {
    const presets = JSON.parse(savedPresets);

    const screensToSet = presets.noOfScreens || 2;
    setScreens(screensToSet);

    const selectElements = document.querySelectorAll("select");
    if (presets.searchEngines && presets.searchEngines.length) {
      presets.searchEngines.forEach((engineIndex, index) => {
        if (selectElements[index]) {
          selectElements[index].selectedIndex = engineIndex;
          const event = new Event("change");
          selectElements[index].dispatchEvent(event);
        }
      });
    } else {
      if (selectElements[0]) {
        selectElements[0].selectedIndex = 0;
        const event1 = new Event("change");
        selectElements[0].dispatchEvent(event1);
      }
      if (selectElements[1]) {
        selectElements[1].selectedIndex = 1;
        const event2 = new Event("change");
        selectElements[1].dispatchEvent(event2);
      }
    }
  } else {
    setScreens(2);
    const selectElements = document.querySelectorAll("select");
    if (selectElements[0]) {
      selectElements[0].selectedIndex = 0;
      const event1 = new Event("change");
      selectElements[0].dispatchEvent(event1);
    }
    if (selectElements[1]) {
      selectElements[1].selectedIndex = 1;
      const event2 = new Event("change");
      selectElements[1].dispatchEvent(event2);
    }
  }
}

function setScreens(number) {
  const screenContainer = document.getElementById("screenContainer");
  const currentScreens = screenContainer.children.length;
  const screenWidth = `${100 / number}%`;

  if (number > currentScreens) {
    for (let i = currentScreens; i < number; i++) {
      createScreen(screenWidth, searchValue);
    }
  } else if (number < currentScreens) {
    for (let i = currentScreens; i > number; i--) {
      screenContainer.removeChild(screenContainer.lastChild);
    }
  }

  Array.from(screenContainer.children).forEach((screen) => {
    screen.style.width = screenWidth;
  });

  noOfScreen = number;
  savePresets();
}

document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    searchValue = document.getElementById("mainSearchInput").value;

    const screenContainer = document.getElementById("screenContainer");
    const currentScreens = screenContainer.children.length;
    const screenWidth = `${100 / noOfScreen}%`;

    for (let i = 0; i < noOfScreen; i++) {
      if (i < currentScreens) {
        const screen = screenContainer.children[i];
        const select = screen.querySelector("select");
        const iframe = screen.querySelector("iframe");

        iframe.src = select.value + searchValue;
      } else {
        createScreen(screenWidth, searchValue);
      }
    }

    savePresets();

    setTimeout(() => {
      this.mainSearchInput.focus();
      this.mainSearchInput.value = "";
    }, 100);
  });

document.addEventListener("click", function (event) {
  const clearIcon = event.target.closest(".clear-icon");
  if (clearIcon) {
    const screen = clearIcon.closest("[data-screen]");

    const screenContainer = document.getElementById("screenContainer");
    if (screenContainer.children.length > 1) {
      screenContainer.removeChild(screen);

      const remainingScreens = screenContainer.children.length;
      const screenWidth = `${100 / remainingScreens}%`;

      Array.from(screenContainer.children).forEach((screen) => {
        screen.style.width = screenWidth;
      });

      noOfScreen = remainingScreens;
      savePresets();
    } else {
      alert("Cannot remove the last screen");
    }
  }
});

function createScreen(width, value) {
  const screenContainer = document.getElementById("screenContainer");
  const screenDiv = document.createElement("div");
  screenDiv.style.width = width;
  screenDiv.setAttribute("data-screen", "true");

  const headerSpan = document.createElement("span");
  headerSpan.className = "screen-header";
  headerSpan.style.display = "flex";
  headerSpan.style.alignItems = "center";
  headerSpan.style.justifyContent = "space-between";

  const engineSelectContainer = document.createElement("div");
  engineSelectContainer.style.display = "flex";
  engineSelectContainer.style.alignItems = "center";

  const logoImg = document.createElement("img");
  logoImg.style.width = "24px";
  logoImg.style.height = "24px";
  logoImg.style.marginRight = "8px";

  const searchEngineSelect = document.createElement("select");
  searchEngines.forEach((engine, index) => {
    const option = document.createElement("option");
    option.value = engine;
    option.text = ["Perplexity.ai", "Google", "Reddit"][index];
    searchEngineSelect.appendChild(option);
  });

  logoImg.src = logos[0];
  logoImg.alt = "Search Engine Logo";

  searchEngineSelect.addEventListener("change", (event) => {
    const selectedIndex = event.target.selectedIndex;
    logoImg.src = logos[selectedIndex];
    iframe.src = searchEngineSelect.value + value;
    savePresets();
  });

  engineSelectContainer.appendChild(logoImg);
  engineSelectContainer.appendChild(searchEngineSelect);

  const iconContainer = document.createElement("div");
  iconContainer.style.display = "flex";
  iconContainer.style.alignItems = "center";
  iconContainer.style.gap = "8px";

  const windowIcon = document.createElement("span");
  windowIcon.style.width = "23px";
  windowIcon.style.height = "23px";
  windowIcon.style.cursor = "pointer";
  windowIcon.innerHTML = `
    <svg width="23px" height="23px" viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="1.8719999999999999"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5 12V6C5 5.44772 5.44772 5 6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H12M8.11111 12H12M12 12V15.8889M12 12L5 19" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
  `;

  windowIcon.addEventListener("click", () => {
    const iframeUrl = iframe.src;
    window.open(iframeUrl, "_blank");
  });

  const clearIcon = document.createElement("span");
  clearIcon.style.width = "20px";
  clearIcon.style.height = "20px";
  clearIcon.style.cursor = "pointer";
  clearIcon.className = "clear-icon";
  clearIcon.innerHTML = `
  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 9L15 15" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15 9L9 15" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <circle cx="12" cy="12" r="9" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle> </g></svg>
`;

  iconContainer.appendChild(windowIcon);
  iconContainer.appendChild(clearIcon);

  headerSpan.appendChild(engineSelectContainer);
  headerSpan.appendChild(iconContainer);

  screenDiv.appendChild(headerSpan);

  const iframe = document.createElement("iframe");
  iframe.title = "search";
  iframe.src = searchEngineSelect.value + value;
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms");

  const iframeContainer = document.createElement("span");
  iframeContainer.className = "iframe-container";
  iframeContainer.appendChild(iframe);
  screenDiv.appendChild(iframeContainer);

  screenContainer.appendChild(screenDiv);
}

document.getElementById("twoScreensBtn").addEventListener("click", () => {
  setScreens(2);
});

document.getElementById("threeScreensBtn").addEventListener("click", () => {
  setScreens(3);
});

document.getElementById("optionBtn").addEventListener("click", () => {
  document.querySelector(".popup").classList.toggle("hidden");
});

document.querySelectorAll("*").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (
      !event.target.closest(".popup") &&
      !event.target.closest("#optionBtn")
    ) {
      document.querySelector(".popup").classList.add("hidden");
    }
  });
});

document.getElementById("themeToggle").addEventListener("change", (e) => {
  if (e.target.value === "light") {
    document.documentElement.classList.remove("dark-mode");
  } else {
    document.documentElement.classList.add("dark-mode");
  }
});

document
  .getElementById("newTabSetting")
  .addEventListener("change", async (e) => {
    const sync = await chrome.storage.sync.set({
      newTabOverride: e.target.checked,
    });
    console.log("Synced", sync);
  });

loadPresets();
