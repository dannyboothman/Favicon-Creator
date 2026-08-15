document.addEventListener("DOMContentLoaded", function () {
  var clearLocalStorageBtn = document.getElementById("clearLocalStorage");

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
