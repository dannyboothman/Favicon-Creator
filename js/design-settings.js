/**
 * Shared design settings: normalize from chrome.storage, gradient CSS,
 * and DOM preview styling used by popup, result, and history.
 */
(function (global) {
  var FontType = (global.FaviconSettings && global.FaviconSettings.FontType) || {
    TEXT: "1",
    FONT_AWESOME: "2",
    IMAGE: "3",
  };
  var BgType = (global.FaviconSettings && global.FaviconSettings.BgType) || {
    SOLID: "1",
    GRADIENT: "2",
    IMAGE: "3",
  };
  var BgGradientType =
    (global.FaviconSettings && global.FaviconSettings.BgGradientType) || {
      LINEAR: "1",
      RADIAL: "2",
    };
  var Border = (global.FaviconSettings && global.FaviconSettings.Border) || {
    ENABLED: "1",
    DISABLED: "2",
  };
  var RadialShape =
    (global.FaviconSettings && global.FaviconSettings.RadialShape) || {
      CIRCLE: "circle",
      ELLIPSE: "ellipse",
    };
  var Defaults =
    (global.FaviconSettings && global.FaviconSettings.Defaults) || {
      fontType: "1",
      bgType: "1",
      bgGradientType: "1",
      bgRadialShape: "circle",
      bgRadialPosition: "center",
      border: "2",
      borderWidth: "1",
    };

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
    "visualImage",
    "visualImageScale",
    "visualImagePosX",
    "visualImagePosY",
    "visualImageOpacity",
    "bgType",
    "bgGradientType",
    "bgRadialShape",
    "bgRadialPosition",
    "bgColor",
    "bgColor2",
    "bgDegrees",
    "bgImage",
    "bgImageScale",
    "bgImagePosX",
    "bgImagePosY",
    "bgImageOpacity",
    "borderRadius",
    "border",
    "borderColor",
    "borderWidth",
  ];

  function numOr(value, fallback) {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }
    var n = Number(value);
    return isNaN(n) ? fallback : n;
  }

  function buildDesignSettings(result) {
    result = result || {};
    return {
      fontType:
        result.fontType != undefined ? result.fontType : Defaults.fontType,
      text: result.text != undefined ? result.text : "F",
      fontAwesome:
        result.fontAwesome != undefined ? result.fontAwesome : "fa-thumbs-up",
      fontFamily:
        result.fontFamily != undefined ? result.fontFamily : "Montserrat",
      fontSize: result.fontSize != undefined ? result.fontSize : "30",
      textColor: result.textColor != undefined ? result.textColor : "#FFFFFF",
      textStyle1: result.textStyle1 === true,
      textStyle2: result.textStyle2 === true,
      textStyle3: result.textStyle3 === true,
      textStyle4: result.textStyle4 === true,
      visualImage: result.visualImage != undefined ? result.visualImage : "",
      visualImageScale: String(
        numOr(result.visualImageScale, 100)
      ),
      visualImagePosX: String(numOr(result.visualImagePosX, 0)),
      visualImagePosY: String(numOr(result.visualImagePosY, 0)),
      visualImageOpacity: String(
        numOr(result.visualImageOpacity, 100)
      ),
      bgType: result.bgType != undefined ? result.bgType : Defaults.bgType,
      bgGradientType:
        result.bgGradientType != undefined
          ? result.bgGradientType
          : Defaults.bgGradientType,
      bgRadialShape:
        result.bgRadialShape != undefined
          ? result.bgRadialShape
          : Defaults.bgRadialShape,
      bgRadialPosition:
        result.bgRadialPosition != undefined
          ? result.bgRadialPosition
          : Defaults.bgRadialPosition,
      bgColor: result.bgColor != undefined ? result.bgColor : "#FE145B",
      bgColor2: result.bgColor2 != undefined ? result.bgColor2 : "#000000",
      bgDegrees: result.bgDegrees != undefined ? result.bgDegrees : 90,
      bgImage: result.bgImage != undefined ? result.bgImage : "",
      bgImageScale: String(numOr(result.bgImageScale, 100)),
      bgImagePosX: String(numOr(result.bgImagePosX, 0)),
      bgImagePosY: String(numOr(result.bgImagePosY, 0)),
      bgImageOpacity: String(numOr(result.bgImageOpacity, 100)),
      borderRadius:
        result.borderRadius != undefined ? result.borderRadius : "0",
      border: result.border != undefined ? result.border : Defaults.border,
      borderColor:
        result.borderColor != undefined ? result.borderColor : "#000000",
      borderWidth:
        result.borderWidth != undefined
          ? result.borderWidth
          : Defaults.borderWidth,
    };
  }

  /**
   * Cover-fit rect inside a square box, then apply scale % and center offsets.
   * scale 100 = cover the box; posX/posY are % of box size from center.
   */
  function computeImageDrawRect(imgW, imgH, boxSize, scalePct, posXPct, posYPct) {
    var iw = Math.max(1, Number(imgW) || 1);
    var ih = Math.max(1, Number(imgH) || 1);
    var box = Math.max(1, Number(boxSize) || 1);
    var cover = Math.max(box / iw, box / ih);
    var userScale = numOr(scalePct, 100) / 100;
    var s = cover * userScale;
    var w = iw * s;
    var h = ih * s;
    var ox = (numOr(posXPct, 0) / 100) * box;
    var oy = (numOr(posYPct, 0) / 100) * box;
    return {
      x: (box - w) / 2 + ox,
      y: (box - h) / 2 + oy,
      w: w,
      h: h,
    };
  }

  function buildBgGradientCss(settingsOrColor1, color2, degrees, gradientType, radialShape, radialPosition) {
    var color1;
    var gType;
    var shape;
    var position;
    var deg;

    if (
      settingsOrColor1 &&
      typeof settingsOrColor1 === "object" &&
      color2 === undefined
    ) {
      var s = buildDesignSettings(settingsOrColor1);
      color1 = s.bgColor;
      color2 = s.bgColor2;
      deg = s.bgDegrees;
      gType = s.bgGradientType;
      shape = s.bgRadialShape;
      position = s.bgRadialPosition;
    } else {
      color1 = settingsOrColor1;
      deg = degrees;
      gType = gradientType;
      shape = radialShape;
      position = radialPosition;
    }

    if (gType == BgGradientType.RADIAL) {
      var radialShapeCss =
        shape == RadialShape.ELLIPSE
          ? RadialShape.ELLIPSE
          : RadialShape.CIRCLE;
      var radialPos = position || Defaults.bgRadialPosition;
      return (
        "radial-gradient(" +
        radialShapeCss +
        " at " +
        radialPos +
        ", " +
        color1 +
        " 0%, " +
        color2 +
        " 78%)"
      );
    }
    return (
      "linear-gradient(" +
      deg +
      "deg, " +
      color1 +
      " 0%, " +
      color2 +
      " 78%)"
    );
  }

  function ensurePreviewLayer(displayEl, className) {
    var layer = displayEl.querySelector("." + className);
    if (!layer) {
      layer = document.createElement("div");
      layer.className = className;
      displayEl.insertBefore(layer, displayEl.firstChild);
    }
    return layer;
  }

  function clearPreviewLayer(displayEl, className) {
    var layer = displayEl.querySelector("." + className);
    if (layer && layer.parentNode) {
      layer.parentNode.removeChild(layer);
    }
  }

  function placePreviewImage(layer, dataUrl, boxSize, scale, posX, posY, opacity) {
    layer.innerHTML = "";
    layer.style.display = "block";
    if (!dataUrl) {
      return;
    }
    var img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.onload = function () {
      var rect = computeImageDrawRect(
        img.naturalWidth,
        img.naturalHeight,
        boxSize,
        scale,
        posX,
        posY
      );
      img.style.left = rect.x + "px";
      img.style.top = rect.y + "px";
      img.style.width = rect.w + "px";
      img.style.height = rect.h + "px";
      img.style.opacity = String(numOr(opacity, 100) / 100);
    };
    img.src = dataUrl;
    layer.appendChild(img);
  }

  /**
   * Apply normalized design settings to preview DOM nodes.
   * @param {HTMLElement} displayEl - outer box (bg, border, radius)
   * @param {HTMLElement} contentEl - inner content (text/icon, typography)
   * @param {object} settings - raw or already-normalized settings
   * @param {object} [options]
   * @param {string} [options.googleFontStylesheetId]
   * @param {boolean} [options.setContent=true] - set text/icon innerHTML
   */
  function applyPreviewStyles(displayEl, contentEl, settings, options) {
    options = options || {};
    var s = buildDesignSettings(settings);
    var setContent = options.setContent !== false;
    var boxSize =
      displayEl.clientWidth ||
      displayEl.offsetWidth ||
      parseFloat(displayEl.style.width) ||
      65;

    contentEl.style.color = s.textColor;
    contentEl.style.fontSize = s.fontSize + "px";
    contentEl.style.fontWeight = s.textStyle1 ? "bold" : "normal";
    contentEl.style.fontStyle = s.textStyle2 ? "italic" : "normal";
    if (s.textStyle3) {
      contentEl.style.textDecoration = "underline";
    } else if (s.textStyle4) {
      contentEl.style.textDecoration = "line-through";
    } else {
      contentEl.style.textDecoration = "inherit";
    }

    if (setContent) {
      if (s.fontType == FontType.IMAGE) {
        contentEl.innerHTML = "";
        contentEl.style.fontSize = "";
        contentEl.style.color = "";
        contentEl.style.fontWeight = "";
        contentEl.style.fontStyle = "";
        contentEl.style.textDecoration = "";
        contentEl.style.fontFamily = "";
        contentEl.style.position = "absolute";
        contentEl.style.left = "0";
        contentEl.style.top = "0";
        contentEl.style.right = "0";
        contentEl.style.bottom = "0";
        contentEl.style.width = "100%";
        contentEl.style.height = "100%";
        contentEl.style.maxWidth = "none";
        var visualLayer = ensurePreviewLayer(
          contentEl,
          "favicon_preview_visual_image"
        );
        placePreviewImage(
          visualLayer,
          s.visualImage,
          boxSize,
          s.visualImageScale,
          s.visualImagePosX,
          s.visualImagePosY,
          s.visualImageOpacity
        );
      } else {
        clearPreviewLayer(contentEl, "favicon_preview_visual_image");
        contentEl.style.position = "";
        contentEl.style.left = "";
        contentEl.style.top = "";
        contentEl.style.right = "";
        contentEl.style.bottom = "";
        contentEl.style.width = "";
        contentEl.style.height = "";
        contentEl.style.maxWidth = "";
        if (s.fontType == FontType.FONT_AWESOME) {
          contentEl.innerHTML =
            '<i class="fa ' + s.fontAwesome + '"></i>';
        } else {
          contentEl.textContent = s.text;
        }
        contentEl.style.fontFamily = s.fontFamily;
      }
    } else if (s.fontType != FontType.IMAGE) {
      contentEl.style.fontFamily = s.fontFamily;
    }

    displayEl.style.borderRadius = s.borderRadius + "%";
    displayEl.style.position = displayEl.style.position || "relative";

    if (s.bgType == BgType.IMAGE) {
      displayEl.style.background = "";
      displayEl.style.backgroundColor = "transparent";
      var bgLayer = ensurePreviewLayer(
        displayEl,
        "favicon_preview_bg_image"
      );
      // Keep content above the bg layer
      if (contentEl.parentNode === displayEl) {
        displayEl.appendChild(contentEl);
      }
      placePreviewImage(
        bgLayer,
        s.bgImage,
        boxSize,
        s.bgImageScale,
        s.bgImagePosX,
        s.bgImagePosY,
        s.bgImageOpacity
      );
    } else {
      clearPreviewLayer(displayEl, "favicon_preview_bg_image");
      if (s.bgType == BgType.GRADIENT) {
        displayEl.style.background = buildBgGradientCss(s);
      } else {
        displayEl.style.background = "";
        displayEl.style.backgroundColor = s.bgColor;
      }
    }

    if (s.border == Border.ENABLED) {
      displayEl.style.border =
        s.borderWidth + "px solid " + s.borderColor;
    } else {
      displayEl.style.border = "";
    }

    if (options.googleFontStylesheetId) {
      var link = document.getElementById(options.googleFontStylesheetId);
      if (link) {
        // Montserrat is bundled locally; only fetch other Google Fonts for preview.
        var needsRemoteFont =
          s.fontType != FontType.FONT_AWESOME &&
          s.fontType != FontType.IMAGE &&
          s.fontFamily &&
          s.fontFamily !== "Montserrat";
        if (needsRemoteFont) {
          link.setAttribute(
            "href",
            "https://fonts.googleapis.com/css?family=" +
              encodeURIComponent(s.fontFamily)
          );
        } else {
          link.removeAttribute("href");
        }
      }
    }

    return s;
  }

  function settingsEqual(a, b) {
    if (!a || !b) {
      return false;
    }
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function pickDesignPayload(settings) {
    var payload = {};
    var s = settings || {};
    DESIGN_KEYS.forEach(function (key) {
      if (s[key] !== undefined) {
        payload[key] = s[key];
      }
    });
    return payload;
  }

  global.FaviconDesign = Object.freeze({
    KEYS: DESIGN_KEYS,
    buildDesignSettings: buildDesignSettings,
    buildBgGradientCss: buildBgGradientCss,
    computeImageDrawRect: computeImageDrawRect,
    applyPreviewStyles: applyPreviewStyles,
    settingsEqual: settingsEqual,
    pickDesignPayload: pickDesignPayload,
  });
})(typeof window !== "undefined" ? window : self);
