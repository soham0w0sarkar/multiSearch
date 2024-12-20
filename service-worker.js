chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "index.html" });
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  chrome.storage.sync.get("newTabOverride", (data) => {
    if (
      data.newTabOverride &&
      tab.status == "loading" &&
      tab.pendingUrl == "chrome://newtab/"
    ) {
      chrome.tabs.update(tab.id, {
        url: "index.html",
      });
    }
  });
});

function updateDynamicRules() {
  chrome.declarativeNetRequest
    .updateDynamicRules({
      removeRuleIds: [1],
      addRules: [
        {
          id: 1,
          condition: {
            urlFilter: "*",
            resourceTypes: ["sub_frame"],
          },
          action: {
            type: "modifyHeaders",
            responseHeaders: [
              { header: "X-Frame-Options", operation: "remove" },
              { header: "Frame-Options", operation: "remove" },
              { header: "Content-Security-Policy", operation: "remove" },
            ],
          },
        },
      ],
    })
    .catch((error) => {
      console.error("Failed to update dynamic rules:", error);
    });
}

updateDynamicRules();

chrome.webNavigation.onCompleted.addListener(updateDynamicRules, {
  url: [{ urlMatches: "http://*/*" }, { urlMatches: "https://*/*" }],
});

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  console.log("details", details);

  if (details.frameId !== 0) {
    return;
  }

  const { defaultEngine } = await chrome.storage.sync.get("defaultEngine");

  if (defaultEngine) {
    const searchUrls = ["https://www.google.com/search"];
    const url = new URL(details.url);

    if (searchUrls.some((searchUrl) => details.url.startsWith(searchUrl))) {
      const searchQuery = url.searchParams.get("q");

      if (searchQuery) {
        chrome.tabs.update(details.tabId, {
          url: `index.html?q=${encodeURIComponent(searchQuery)}`,
        });
      }
    }
  }
});

chrome.omnibox.onInputEntered.addListener((text) => {
  const encodedData = encodeURIComponent(text);
  const url = `index.html?data=${encodedData}`;

  console.log("url", url);

  chrome.tabs.create({ url });
});
