chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "index.html" });
  }
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

chrome.omnibox.onInputEntered.addListener((text) => {
  const encodedData = encodeURIComponent(text);
  const url = `index.html?data=${encodedData}`;

  chrome.tabs.create({ url });
});
