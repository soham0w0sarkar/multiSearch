const renderBookMark = () => {
  const bookMark = document.createElement("span");

  bookMark.style.display = "inline-block";
  bookMark.style.width = "40px";
  bookMark.style.height = "40px";
  bookMark.style.background = "transparent";
  bookMark.style.position = "fixed";
  bookMark.style.top = "calc(75% - 22.5px)";
  bookMark.style.right = "0";
  bookMark.style.padding = "4px 0 4px 2px";
  bookMark.style.cursor = "pointer";
  bookMark.style.zIndex = "9999";

  const bookMarkPngImg = document.createElement("img");
  bookMarkPngImg.src = chrome.runtime.getURL("icons/Widget.svg");
  bookMarkPngImg.style.width = "100%";
  bookMarkPngImg.style.height = "100%";
  bookMark.style.zIndex = "10001";

  bookMark.appendChild(bookMarkPngImg);

  document.body.appendChild(bookMark);

  bookMark.addEventListener("click", () => {
    openNewTab();
  });
};

const openNewTab = () => {
  window.open(chrome.runtime.getURL("index.html"), "_blank");
};

chrome.storage.sync.get();

if (
  window.location.href !==
  "chrome-extension://oeajpoocanmjifppihgpnmjjfcfmjamd/index.html"
) {
  renderBookMark();
}
