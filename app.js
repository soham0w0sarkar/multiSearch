let noOfScreen = 2;
let searchValue = "";

const searchEngines = [
  "https://www.perplexity.ai/search?q=",
  "https://www.google.com/search?q=",
  "https://www.reddit.com/search/?q=",
  "https://www.bing.com/search?q=",
  "https://chatgpt.com/?q=&hints=search&ref=ext",
  "https://gemini.google.com/search?q=",
  "https://copilot.microsoft.com/?q=",
];

const logos = [
  "./icons/logo/perplexity.svg",
  "./icons/logo/google.svg",
  "./icons/logo/reddit.svg",
  "./icons/logo/bing.svg",
  "./icons/logo/chatgpt.svg",
  "./icons/logo/gemini.svg",
  "./icons/logo/copilot.svg",
];

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("q");
  if (searchQuery) {
    searchValue = searchQuery;
  }

  loadPresets();
});

function savePresets() {
  const presets = {
    noOfScreens: noOfScreen,
    searchEngines: Array.from(document.querySelectorAll("select")).map(
      (select) => select.selectedIndex
    ),
    theme: document.getElementById("themeToggle").value,
    value: searchValue,
  };
  localStorage.setItem("multiSearchPresets", JSON.stringify(presets));
}

function loadPresets() {
  chrome.storage.sync.get("newTabOverride", (data) => {
    document.getElementById("newTabSetting").checked =
      data.newTabOverride || false;
  });

  chrome.storage.sync.get("defaultEngine", (data) => {
    document.getElementById("defaultEngineSetting").checked =
      data.defaultEngine || false;
  });

  const savedPresets = localStorage.getItem("multiSearchPresets");
  if (savedPresets) {
    const presets = JSON.parse(savedPresets);

    const screensToSet = presets.noOfScreens || 2;
    setScreens(screensToSet);

    if (presets.theme) {
      document.getElementById("themeToggle").value = presets.theme;
      if (presets.theme === "dark") {
        document.querySelector(".logo img").src = "./icons/Logo-DarkMode.svg";
        document.documentElement.classList.add("dark-mode");
      } else {
        document.querySelector(".logo img").src = "./icons/Logo-LightMode.svg";
        document.documentElement.classList.remove("dark-mode");
      }
    }

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

    if (!searchValue && presets.value) {
      searchValue = presets.value;
      const mainSearchInput = document.getElementById("mainSearchInput");
      if (mainSearchInput) {
        mainSearchInput.value = searchValue;
      }
    }

    if (searchValue) {
      const screenContainer = document.getElementById("screenContainer");
      const currentScreens = screenContainer.children.length;
      for (let i = 0; i < Math.min(noOfScreen, currentScreens); i++) {
        const screen = screenContainer.children[i];
        const select = screen.querySelector("select");
        const iframe = screen.querySelector("iframe");
        if (select && iframe) {
          iframe.src = select.value + searchValue;
        }
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

function constructSearchUrl(engineUrl, searchQuery) {
  if (engineUrl.includes("chatgpt.com")) {
    return engineUrl.replace("q=&", `q=${encodeURIComponent(searchQuery)}&`);
  }
  return engineUrl + encodeURIComponent(searchQuery);
}

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("mainSearchInput");

const searchIcon = document.querySelector(".icon");

searchInput.addEventListener("focus", function () {
  searchIcon.classList.add("visible");
  searchForm.classList.add("active");
});

searchInput.addEventListener("blur", function () {
  if (this.value.trim() === "") {
    searchIcon.classList.remove("visible");
    searchForm.classList.remove("active");
  }
});

searchForm.addEventListener("submit", function (event) {
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

      iframe.src = constructSearchUrl(select.value, searchValue);
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
    option.text = [
      "Perplexity.ai",
      "Google",
      "Reddit",
      "Bing",
      "ChatGpt",
      "Google Gemini",
      "Bing Copilot",
    ][index];
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
  windowIcon.classList.add("containerIcon");
  windowIcon.style.width = "16px";
  windowIcon.style.height = "16px";
  windowIcon.style.cursor = "pointer";

  windowIcon.innerHTML = `<svg
                    class="window"
                    fill="#000000"
                    width="16px"
                    height="16px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        fill-rule="evenodd"
                        stroke="#000000"
                        stroke-width="0.5"
                        d="M5,2 L7,2 C7.55228475,2 8,2.44771525 8,3 C8,3.51283584 7.61395981,3.93550716 7.11662113,3.99327227 L7,4 L5,4 C4.48716416,4 4.06449284,4.38604019 4.00672773,4.88337887 L4,5 L4,19 C4,19.5128358 4.38604019,19.9355072 4.88337887,19.9932723 L5,20 L19,20 C19.5128358,20 19.9355072,19.6139598 19.9932723,19.1166211 L20,19 L20,17 C20,16.4477153 20.4477153,16 21,16 C21.5128358,16 21.9355072,16.3860402 21.9932723,16.8833789 L22,17 L22,19 C22,20.5976809 20.75108,21.9036609 19.1762728,21.9949073 L19,22 L5,22 C3.40231912,22 2.09633912,20.75108 2.00509269,19.1762728 L2,19 L2,5 C2,3.40231912 3.24891996,2.09633912 4.82372721,2.00509269 L5,2 L7,2 L5,2 Z M21,2 L21.081,2.003 L21.2007258,2.02024007 L21.2007258,2.02024007 L21.3121425,2.04973809 L21.3121425,2.04973809 L21.4232215,2.09367336 L21.5207088,2.14599545 L21.5207088,2.14599545 L21.6167501,2.21278596 L21.7071068,2.29289322 L21.7071068,2.29289322 L21.8036654,2.40469339 L21.8036654,2.40469339 L21.8753288,2.5159379 L21.9063462,2.57690085 L21.9063462,2.57690085 L21.9401141,2.65834962 L21.9401141,2.65834962 L21.9641549,2.73400703 L21.9641549,2.73400703 L21.9930928,2.8819045 L21.9930928,2.8819045 L22,3 L22,3 L22,9 C22,9.55228475 21.5522847,10 21,10 C20.4477153,10 20,9.55228475 20,9 L20,5.414 L13.7071068,11.7071068 C13.3466228,12.0675907 12.7793918,12.0953203 12.3871006,11.7902954 L12.2928932,11.7071068 C11.9324093,11.3466228 11.9046797,10.7793918 12.2097046,10.3871006 L12.2928932,10.2928932 L18.584,4 L15,4 C14.4477153,4 14,3.55228475 14,3 C14,2.44771525 14.4477153,2 15,2 L21,2 Z"
                      ></path>
                    </g>
                  </svg>`;

  windowIcon.addEventListener("click", () => {
    const iframeUrl = iframe.src;
    window.open(iframeUrl, "_blank");
  });

  const clearIcon = document.createElement("span");
  clearIcon.classList.add("containerIcon");
  clearIcon.classList.add("clear-icon");
  clearIcon.style.width = "20px";
  clearIcon.style.height = "20px";
  clearIcon.style.cursor = "pointer";
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
  const logoImg = document.querySelector(".logo img");

  if (e.target.value === "light") {
    document.documentElement.classList.remove("dark-mode");
    logoImg.src = "./icons/Logo-LightMode.svg";
  } else {
    document.documentElement.classList.add("dark-mode");
    logoImg.src = "./icons/Logo-DarkMode.svg";
  }

  savePresets();
});

document
  .getElementById("newTabSetting")
  .addEventListener("change", async (e) => {
    await chrome.storage.sync.set({
      newTabOverride: e.target.checked,
    });
  });

document
  .getElementById("defaultEngineSetting")
  .addEventListener("change", async (e) => {
    await chrome.storage.sync.set({
      defaultEngine: e.target.checked,
    });
  });
