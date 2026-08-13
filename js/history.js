document.addEventListener("DOMContentLoaded", function () {
  var FontType = FaviconSettings.FontType;
  var BgType = FaviconSettings.BgType;
  var BgGradientType = FaviconSettings.BgGradientType;
  var Border = FaviconSettings.Border;
  var RadialShape = FaviconSettings.RadialShape;
  var SettingsDefaults = FaviconSettings.Defaults;
  var HISTORY_KEY = "faviconHistory";
  var DESIGN_KEYS = [
    "fontType",
    "text",
    "fontAwesome",
    "fontFamily",
    "fontSize",
    "textColor",
    "textStyle1",
    "textStyle2",
    "textStyle3",
    "textStyle4",
    "bgType",
    "bgGradientType",
    "bgRadialShape",
    "bgRadialPosition",
    "bgColor",
    "bgColor2",
    "bgDegrees",
    "borderRadius",
    "border",
    "borderColor",
    "borderWidth",
  ];
  var historyListEl = document.getElementById("favicon_history_list");
  var historyEmptyEl = document.getElementById("favicon_history_empty");

  function historyLabel(settings) {
    if (settings.fontType == FontType.FONT_AWESOME) {
      return (settings.fontAwesome || "fa-thumbs-up").replace(/^fa-/, "");
    }
    return settings.text || "F";
  }

  function formatHistoryTime(ts) {
    try {
      return new Date(ts).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  }

  function ensureHistoryFonts(history) {
    var families = {};
    history.forEach(function (entry) {
      var settings = entry && entry.settings;
      if (!settings || settings.fontType == FontType.FONT_AWESOME) {
        return;
      }
      var family = settings.fontFamily || "Montserrat";
      families[family] = true;
    });
    var names = Object.keys(families);
    if (names.length === 0) {
      return;
    }
    var link = document.getElementById("historyFontsStylesheet");
    if (!link) {
      link = document.createElement("link");
      link.id = "historyFontsStylesheet";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href =
      "https://fonts.googleapis.com/css?family=" +
      names.map(encodeURIComponent).join("|");
  }

  function buildHistoryThumb(settings) {
    settings = settings || {};
    var thumbWrap = document.createElement("div");
    thumbWrap.className = "favicon_history_thumb";

    var stage = document.createElement("div");
    stage.className = "favicon_history_preview";

    var display = document.createElement("div");
    display.className = "favicon_history_preview_display";

    var content = document.createElement("div");
    content.className = "favicon_history_preview_content";

    var fontType = settings.fontType != undefined ? settings.fontType : SettingsDefaults.fontType;
    var textColor = settings.textColor || "#FFFFFF";
    var fontSize = settings.fontSize != undefined ? settings.fontSize : "30";
    var fontFamily = settings.fontFamily || "Montserrat";
    var borderRadius = settings.borderRadius != undefined ? settings.borderRadius : "0";
    var bgType = settings.bgType != undefined ? settings.bgType : SettingsDefaults.bgType;
    var bgColor = settings.bgColor || "#FE145B";
    var bgColor2 = settings.bgColor2 || "#000000";
    var bgDegrees = settings.bgDegrees != undefined ? settings.bgDegrees : 90;
    var bgGradientType =
      settings.bgGradientType != undefined
        ? settings.bgGradientType
        : SettingsDefaults.bgGradientType;
    var bgRadialShape =
      settings.bgRadialShape != undefined
        ? settings.bgRadialShape
        : SettingsDefaults.bgRadialShape;
    var bgRadialPosition =
      settings.bgRadialPosition != undefined
        ? settings.bgRadialPosition
        : SettingsDefaults.bgRadialPosition;
    var border =
      settings.border != undefined ? settings.border : SettingsDefaults.border;
    var borderColor = settings.borderColor || "#000000";
    var borderWidth =
      settings.borderWidth != undefined
        ? settings.borderWidth
        : SettingsDefaults.borderWidth;

    content.style.color = textColor;
    content.style.fontSize = fontSize + "px";
    content.style.fontWeight = settings.textStyle1 === true ? "bold" : "normal";
    content.style.fontStyle = settings.textStyle2 === true ? "italic" : "normal";
    if (settings.textStyle3 === true) {
      content.style.textDecoration = "underline";
    } else if (settings.textStyle4 === true) {
      content.style.textDecoration = "line-through";
    } else {
      content.style.textDecoration = "inherit";
    }

    if (fontType == FontType.FONT_AWESOME) {
      content.innerHTML =
        '<i class="fa ' + (settings.fontAwesome || "fa-thumbs-up") + '"></i>';
    } else {
      content.textContent = settings.text || "F";
      content.style.fontFamily = fontFamily;
    }

    display.style.borderRadius = borderRadius + "%";
    if (bgType == BgType.GRADIENT) {
      if (bgGradientType == BgGradientType.RADIAL) {
        var radialShape =
          bgRadialShape == RadialShape.ELLIPSE ? "ellipse" : "circle";
        display.style.background =
          "radial-gradient(" +
          radialShape +
          " at " +
          bgRadialPosition +
          ", " +
          bgColor +
          " 0%, " +
          bgColor2 +
          " 78%)";
      } else {
        display.style.background =
          "linear-gradient(" +
          bgDegrees +
          "deg, " +
          bgColor +
          " 0%, " +
          bgColor2 +
          " 78%)";
      }
    } else {
      display.style.backgroundColor = bgColor;
    }

    if (border == Border.ENABLED) {
      display.style.border = borderWidth + "px solid " + borderColor;
    }

    display.appendChild(content);
    stage.appendChild(display);
    thumbWrap.appendChild(stage);
    return thumbWrap;
  }

  function loadHistoryEntry(entry) {
    if (!entry || !entry.settings) {
      return;
    }
    var payload = {};
    DESIGN_KEYS.forEach(function (key) {
      if (entry.settings[key] !== undefined) {
        payload[key] = entry.settings[key];
      }
    });
    chrome.storage.local.set(payload, function () {
      location.href = "popup.html";
    });
  }

  function deleteHistoryEntry(entryId) {
    chrome.storage.local.get([HISTORY_KEY], function (stored) {
      var history = Array.isArray(stored[HISTORY_KEY])
        ? stored[HISTORY_KEY]
        : [];
      history = history.filter(function (item) {
        return item.id !== entryId;
      });
      var payload = {};
      payload[HISTORY_KEY] = history;
      chrome.storage.local.set(payload, function () {
        renderFaviconHistory();
      });
    });
  }

  function stripStoredThumbs(history) {
    var changed = false;
    var cleaned = history.map(function (entry) {
      if (!entry || entry.thumbDataUrl === undefined) {
        return entry;
      }
      changed = true;
      return {
        id: entry.id,
        createdAt: entry.createdAt,
        settings: entry.settings,
      };
    });
    if (changed) {
      var payload = {};
      payload[HISTORY_KEY] = cleaned;
      chrome.storage.local.set(payload);
    }
    return cleaned;
  }

  function renderFaviconHistory() {
    chrome.storage.local.get([HISTORY_KEY], function (stored) {
      var history = Array.isArray(stored[HISTORY_KEY])
        ? stored[HISTORY_KEY]
        : [];
      history = stripStoredThumbs(history);
      historyListEl.innerHTML = "";
      if (history.length === 0) {
        historyEmptyEl.style.display = "block";
        return;
      }
      historyEmptyEl.style.display = "none";
      ensureHistoryFonts(history);
      history.forEach(function (entry) {
        var row = document.createElement("div");
        row.className = "favicon_history_row";

        var thumbWrap = buildHistoryThumb(entry.settings || {});

        var meta = document.createElement("div");
        meta.className = "favicon_history_meta";
        var title = document.createElement("div");
        title.className = "favicon_history_title";
        title.textContent = historyLabel(entry.settings || {});
        var time = document.createElement("div");
        time.className = "favicon_history_time";
        time.textContent = formatHistoryTime(entry.createdAt);
        meta.appendChild(title);
        meta.appendChild(time);

        var actions = document.createElement("div");
        actions.className = "favicon_history_actions";

        var loadBtn = document.createElement("button");
        loadBtn.type = "button";
        loadBtn.className = "button button_inline favicon_history_load";
        loadBtn.setAttribute("aria-label", "Load");
        loadBtn.innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i>';
        loadBtn.addEventListener("click", function () {
          loadHistoryEntry(entry);
        });

        var deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "favicon_history_delete";
        deleteBtn.setAttribute("aria-label", "Delete");
        deleteBtn.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
        deleteBtn.addEventListener("click", function () {
          deleteHistoryEntry(entry.id);
        });

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);
        row.appendChild(thumbWrap);
        row.appendChild(meta);
        row.appendChild(actions);
        historyListEl.appendChild(row);
      });
    });
  }

  renderFaviconHistory();
});
