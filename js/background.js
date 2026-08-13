var disconnectTimer = null;
var RESTORE_DEBOUNCE_MS = 300;
var PREVIEW_TAB_KEY = "tabFaviconPreviewTabId";

function restoreOriginalFaviconNow() {
    if (!window.__fcFaviconOriginalsCaptured) {
        return;
    }

    window.__fcFaviconRestoreToken = (window.__fcFaviconRestoreToken || 0) + 1;

    var links = document.head.querySelectorAll('link[rel*="icon"]');
    for (var i = links.length - 1; i >= 0; i--) {
        if (links[i].parentNode) {
            links[i].parentNode.removeChild(links[i]);
        }
    }

    var originals = window.__fcFaviconOriginals || [];
    for (var j = 0; j < originals.length; j++) {
        var attrs = originals[j];
        var restored = document.createElement("link");
        if (attrs.rel) {
            restored.setAttribute("rel", attrs.rel);
        }
        if (attrs.type) {
            restored.setAttribute("type", attrs.type);
        }
        if (attrs.href) {
            restored.setAttribute("href", attrs.href);
        }
        if (attrs.sizes) {
            restored.setAttribute("sizes", attrs.sizes);
        }
        if (attrs.media) {
            restored.setAttribute("media", attrs.media);
        }
        if (attrs.color) {
            restored.setAttribute("color", attrs.color);
        }
        document.head.appendChild(restored);
    }

    window.__fcFaviconOriginalsCaptured = false;
    window.__fcFaviconOriginals = null;
}

function restorePreviewTab(tabId) {
    if (tabId == null || !chrome.scripting) {
        return;
    }
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: restoreOriginalFaviconNow
    }).catch(function () {
        // Tab gone or restricted — nothing to restore.
    });
}

chrome.runtime.onConnect.addListener(function (port) {
    if (port.name !== "favicon-popup") {
        return;
    }

    // A new popup page connected (open or in-extension navigation).
    clearTimeout(disconnectTimer);
    disconnectTimer = null;

    port.onDisconnect.addListener(function () {
        // Wait briefly so navigating popup.html → result.html can reconnect.
        disconnectTimer = setTimeout(function () {
            disconnectTimer = null;
            chrome.storage.session.get([PREVIEW_TAB_KEY], function (result) {
                var tabId = result && result[PREVIEW_TAB_KEY];
                if (tabId != null) {
                    restorePreviewTab(tabId);
                }
            });
        }, RESTORE_DEBOUNCE_MS);
    });
});
