document.addEventListener('DOMContentLoaded', function() {

    var settingsClearLocalStorage = document.getElementById("clearLocalStorage");
    
    settingsClearLocalStorage.addEventListener('click', function() {
        chrome.storage.local.clear();
        location.reload();
    });

});