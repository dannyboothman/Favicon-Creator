(function (global) {
  var debounceTimer = null;
  var keepaliveTimer = null;
  var DEBOUNCE_MS = 200;
  var KEEPALIVE_MS = 300;
  var WATCHDOG_STALE_MS = 900;
  var SESSION_KEY = "tabFaviconPreviewDataUrl";
  var PREVIEW_TAB_KEY = "tabFaviconPreviewTabId";
  var lastPreviewTabId = null;
  var popupPort = null;

  // NOTE: Functions passed to chrome.scripting.executeScript are serialized into
  // the page. They must be self-contained (no closure references).

  function setPageFavicon(href, watchdogStaleMs) {
    window.__fcFaviconRestoreToken = (window.__fcFaviconRestoreToken || 0) + 1;
    window.__fcFaviconKeepalive = Date.now();

    if (!window.__fcFaviconOriginalsCaptured) {
      window.__fcFaviconOriginalsCaptured = true;
      window.__fcFaviconOriginals = Array.prototype.map.call(
        document.head.querySelectorAll('link[rel*="icon"]'),
        function (link) {
          return {
            rel: link.getAttribute("rel"),
            type: link.getAttribute("type"),
            href: link.getAttribute("href"),
            sizes: link.getAttribute("sizes"),
            media: link.getAttribute("media"),
            color: link.getAttribute("color"),
          };
        },
      );
    }

    if (!window.__fcFaviconWatchdogReady) {
      window.__fcFaviconWatchdogReady = true;
      window.__fcFaviconWatchdogStaleMs = watchdogStaleMs || 900;
      setInterval(function () {
        if (!window.__fcFaviconOriginalsCaptured) {
          return;
        }
        if (
          Date.now() - (window.__fcFaviconKeepalive || 0) <
          window.__fcFaviconWatchdogStaleMs
        ) {
          return;
        }

        window.__fcFaviconRestoreToken =
          (window.__fcFaviconRestoreToken || 0) + 1;

        var staleLinks = document.head.querySelectorAll('link[rel*="icon"]');
        for (var i = staleLinks.length - 1; i >= 0; i--) {
          if (staleLinks[i].parentNode) {
            staleLinks[i].parentNode.removeChild(staleLinks[i]);
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
      }, 250);
    }

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

  function petFaviconKeepalive() {
    window.__fcFaviconKeepalive = Date.now();
  }

  function canScriptTab(tab) {
    if (!tab || tab.id == null) {
      return false;
    }
    var url = tab.url || "";
    if (!url) {
      return true;
    }
    return !/^(chrome|chrome-extension|edge|about|devtools|chrome-search|view-source):/i.test(
      url,
    );
  }

  function rememberPreviewTab(tabId) {
    lastPreviewTabId = tabId;
    if (!chrome.storage || !chrome.storage.session) {
      return;
    }
    var payload = {};
    payload[PREVIEW_TAB_KEY] = tabId;
    chrome.storage.session.set(payload);
  }

  function startKeepalivePets() {
    if (keepaliveTimer) {
      return;
    }
    keepaliveTimer = setInterval(function () {
      if (lastPreviewTabId == null || !chrome.scripting) {
        return;
      }
      chrome.scripting
        .executeScript({
          target: { tabId: lastPreviewTabId },
          func: petFaviconKeepalive,
        })
        .catch(function () {
          // Restricted/closed tabs fail quietly.
        });
    }, KEEPALIVE_MS);
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

      rememberPreviewTab(tab.id);
      startKeepalivePets();
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: setPageFavicon,
          args: [dataUrl, WATCHDOG_STALE_MS],
        })
        .catch(function () {
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

  function previewFaviconInActiveTab(settings) {
    if (
      !settings ||
      !global.FaviconCanvas ||
      typeof FaviconCanvas.renderToDataURL !== "function"
    ) {
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      FaviconCanvas.renderToDataURL(settings, 64, "image/png")
        .then(function (dataUrl) {
          cachePreviewDataUrl(dataUrl);
          injectIntoActiveTab(dataUrl);
        })
        .catch(function () {
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

  function connectPopupPort() {
    if (!chrome.runtime || !chrome.runtime.connect) {
      return;
    }
    try {
      popupPort = chrome.runtime.connect({ name: "favicon-popup" });
      popupPort.onDisconnect.addListener(function () {
        popupPort = null;
      });
    } catch (err) {
      popupPort = null;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    connectPopupPort();

    // Editor pages push a fresh capture; other pages re-apply the last preview.
    if (!document.getElementById("favicon_display_container")) {
      restoreTabFaviconPreview();
    }
  });

  global.previewFaviconInActiveTab = previewFaviconInActiveTab;
  global.restoreTabFaviconPreview = restoreTabFaviconPreview;
})(window);
