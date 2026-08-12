(function (global) {
    var debounceTimer = null;
    var DEBOUNCE_MS = 200;
    var SESSION_KEY = "tabFaviconPreviewDataUrl";

    function setPageFavicon(href) {
        var links = document.head.querySelectorAll('link[rel*="icon"]');
        for (var i = links.length - 1; i >= 0; i--) {
            if (links[i].parentNode) {
                links[i].parentNode.removeChild(links[i]);
            }
        }
        var link = document.createElement("link");
        link.setAttribute("rel", "icon");
        link.type = "image/png";
        link.href = href;
        document.head.appendChild(link);
    }

    function canScriptTab(tab) {
        if (!tab || tab.id == null) {
            return false;
        }
        var url = tab.url || "";
        if (!url) {
            return true;
        }
        return !/^(chrome|chrome-extension|edge|about|devtools|chrome-search|view-source):/i.test(url);
    }

    function injectIntoActiveTab(dataUrl) {
        if (!dataUrl || !chrome.tabs || !chrome.scripting) {
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs && tabs[0];
            if (!canScriptTab(tab)) {
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: setPageFavicon,
                args: [dataUrl]
            }).catch(function () {
                // Restricted pages (Web Store, PDFs, etc.) fail quietly.
            });
        });
    }

    function cachePreviewDataUrl(dataUrl) {
        if (!chrome.storage || !chrome.storage.session) {
            return;
        }
        var payload = {};
        payload[SESSION_KEY] = dataUrl;
        chrome.storage.session.set(payload);
    }

    function previewFaviconInActiveTab(sourceEl) {
        if (!sourceEl || typeof html2canvas !== "function") {
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            var fontsReady = (document.fonts && document.fonts.ready)
                ? document.fonts.ready
                : Promise.resolve();

            fontsReady.then(function () {
                return html2canvas(sourceEl, {
                    logging: false,
                    scale: 1,
                    backgroundColor: null,
                    width: sourceEl.offsetWidth || 65,
                    height: sourceEl.offsetHeight || 65
                });
            }).then(function (canvas) {
                var dataUrl = canvas.toDataURL("image/png");
                cachePreviewDataUrl(dataUrl);
                injectIntoActiveTab(dataUrl);
            }).catch(function () {
                // Capture failures should not break the editor.
            });
        }, DEBOUNCE_MS);
    }

    function restoreTabFaviconPreview() {
        if (!chrome.storage || !chrome.storage.session) {
            return;
        }
        chrome.storage.session.get([SESSION_KEY], function (result) {
            if (result && result[SESSION_KEY]) {
                injectIntoActiveTab(result[SESSION_KEY]);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        // Editor pages push a fresh capture; other pages re-apply the last preview.
        if (!document.getElementById("favicon_display_container")) {
            restoreTabFaviconPreview();
        }
    });

    global.previewFaviconInActiveTab = previewFaviconInActiveTab;
    global.restoreTabFaviconPreview = restoreTabFaviconPreview;
})(window);
