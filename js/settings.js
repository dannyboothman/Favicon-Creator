document.addEventListener("DOMContentLoaded", function () {
  var HISTORY_KEY = "faviconHistory";
  var clearLocalStorageBtn = document.getElementById("clearLocalStorage");
  var clearHistoryBtn = document.getElementById("clearHistory");

  clearHistoryBtn.addEventListener("click", function () {
    if (
      !confirm(
        "Clear download history only? Theme and design settings will be kept."
      )
    ) {
      return;
    }
    chrome.storage.local.remove(HISTORY_KEY, function () {
      location.reload();
    });
  });

  clearLocalStorageBtn.addEventListener("click", function () {
    if (
      !confirm(
        "Clear all local storage? This removes history, theme, and design settings."
      )
    ) {
      return;
    }
    chrome.storage.local.clear(function () {
      location.reload();
    });
  });
});
