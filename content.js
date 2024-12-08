const renderBookMark = () => {
  const bookMark = document.createElement("span");

  bookMark.style.display = "inline-block";
  bookMark.style.width = "70px";
  bookMark.style.height = "45px";
  bookMark.style.background = "#fff";
  bookMark.style.position = "fixed";
  bookMark.style.top = "calc(75% - 22.5px)";
  bookMark.style.right = "0";
  bookMark.style.border = "1px solid #000";
  bookMark.style.cursor = "pointer";
  bookMark.style.zIndex = "9999";

  document.body.appendChild(bookMark);

  bookMark.addEventListener("click", () => {
    openNewTab();
  });
};

const openNewTab = () => {
  window.open(chrome.runtime.getURL("index.html"), "_blank");
};

if (
  window.location.href !==
  "chrome-extension://oeajpoocanmjifppihgpnmjjfcfmjamd/index.html"
) {
  renderBookMark();
}
