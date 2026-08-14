/**
 * Build an SVG favicon document from design settings (mirrors FaviconCanvas).
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

  var DESIGN_BASE = 128;
  var FA_UNITS = 1792;
  var FA_ASCENT = 1536;
  var FA_DESCENT = -256;
  var FA_MID_Y = (FA_ASCENT + FA_DESCENT) / 2;

  function escapeXml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function normalizeSettings(settings) {
    if (global.FaviconCanvas && global.FaviconCanvas.normalizeSettings) {
      return global.FaviconCanvas.normalizeSettings(settings);
    }
    if (global.FaviconDesign && global.FaviconDesign.buildDesignSettings) {
      return global.FaviconDesign.buildDesignSettings(settings);
    }
    return settings || {};
  }

  function computeImageDrawRect(imgW, imgH, boxSize, scalePct, posXPct, posYPct) {
    if (global.FaviconDesign && global.FaviconDesign.computeImageDrawRect) {
      return global.FaviconDesign.computeImageDrawRect(
        imgW,
        imgH,
        boxSize,
        scalePct,
        posXPct,
        posYPct
      );
    }
    var iw = Math.max(1, Number(imgW) || 1);
    var ih = Math.max(1, Number(imgH) || 1);
    var box = Math.max(1, Number(boxSize) || 1);
    var cover = Math.max(box / iw, box / ih);
    var userScale = (Number(scalePct) || 100) / 100;
    var s = cover * userScale;
    var w = iw * s;
    var h = ih * s;
    var ox = ((Number(posXPct) || 0) / 100) * box;
    var oy = ((Number(posYPct) || 0) / 100) * box;
    return {
      x: (box - w) / 2 + ox,
      y: (box - h) / 2 + oy,
      w: w,
      h: h,
    };
  }

  function parseRadialPosition(position, size) {
    var pos = String(position || "center").toLowerCase().trim();
    var x = size / 2;
    var y = size / 2;

    function axisValue(token, horizontal) {
      if (token === "center" || token === "centre") {
        return size / 2;
      }
      if (horizontal) {
        if (token === "left") return 0;
        if (token === "right") return size;
      } else {
        if (token === "top") return 0;
        if (token === "bottom") return size;
      }
      var pct = token.match(/^(-?[\d.]+)%$/);
      if (pct) {
        return (parseFloat(pct[1]) / 100) * size;
      }
      var px = token.match(/^(-?[\d.]+)px$/);
      if (px) {
        return parseFloat(px[1]);
      }
      var num = parseFloat(token);
      if (!isNaN(num)) {
        return num;
      }
      return size / 2;
    }

    var parts = pos.split(/\s+/);
    if (parts.length === 1) {
      if (parts[0] === "top" || parts[0] === "bottom") {
        y = axisValue(parts[0], false);
      } else if (parts[0] === "left" || parts[0] === "right") {
        x = axisValue(parts[0], true);
      } else if (parts[0] === "center" || parts[0] === "centre") {
        x = size / 2;
        y = size / 2;
      } else {
        x = axisValue(parts[0], true);
        y = size / 2;
      }
    } else {
      var a = parts[0];
      var b = parts[1];
      var aIsY = a === "top" || a === "bottom";
      var bIsX = b === "left" || b === "right";
      if (aIsY || bIsX) {
        y = axisValue(a, false);
        x = axisValue(b, true);
      } else {
        x = axisValue(a, true);
        y = axisValue(b, false);
      }
    }

    return { x: x, y: y };
  }

  function linearGradientEndpoints(size, degrees) {
    var rad = ((degrees % 360) * Math.PI) / 180;
    var half = size / 2;
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);
    var length = Math.abs(size * sin) + Math.abs(size * cos);
    var halfLen = length / 2;
    return {
      x0: half - sin * halfLen,
      y0: half + cos * halfLen,
      x1: half + sin * halfLen,
      y1: half - cos * halfLen,
    };
  }

  function buildBackgroundFill(settings, size, defs) {
    if (settings.bgType == BgType.IMAGE) {
      return 'fill="none"';
    }

    if (settings.bgType == BgType.GRADIENT) {
      if (settings.bgGradientType == BgGradientType.RADIAL) {
        var center = parseRadialPosition(settings.bgRadialPosition, size);
        var isEllipse = settings.bgRadialShape == RadialShape.ELLIPSE;
        var coverRadius = Math.sqrt(
          Math.max(center.x, size - center.x) *
            Math.max(center.x, size - center.x) +
            Math.max(center.y, size - center.y) *
              Math.max(center.y, size - center.y)
        );
        var gradId = "fc-bg-radial";
        if (isEllipse) {
          var ratio = 0.75;
          defs.push(
            '<radialGradient id="' +
              gradId +
              '" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="' +
              coverRadius +
              '" gradientTransform="translate(' +
              center.x +
              " " +
              center.y +
              ") scale(1 " +
              ratio +
              ')">' +
              '<stop offset="0%" stop-color="' +
              escapeXml(settings.bgColor) +
              '"/>' +
              '<stop offset="78%" stop-color="' +
              escapeXml(settings.bgColor2) +
              '"/>' +
              "</radialGradient>"
          );
        } else {
          defs.push(
            '<radialGradient id="' +
              gradId +
              '" gradientUnits="userSpaceOnUse" cx="' +
              center.x +
              '" cy="' +
              center.y +
              '" r="' +
              coverRadius +
              '">' +
              '<stop offset="0%" stop-color="' +
              escapeXml(settings.bgColor) +
              '"/>' +
              '<stop offset="78%" stop-color="' +
              escapeXml(settings.bgColor2) +
              '"/>' +
              "</radialGradient>"
          );
        }
        return 'fill="url(#' + gradId + ')"';
      }

      var ends = linearGradientEndpoints(size, settings.bgDegrees);
      var linearId = "fc-bg-linear";
      defs.push(
        '<linearGradient id="' +
          linearId +
          '" gradientUnits="userSpaceOnUse" x1="' +
          ends.x0 +
          '" y1="' +
          ends.y0 +
          '" x2="' +
          ends.x1 +
          '" y2="' +
          ends.y1 +
          '">' +
          '<stop offset="0%" stop-color="' +
          escapeXml(settings.bgColor) +
          '"/>' +
          '<stop offset="78%" stop-color="' +
          escapeXml(settings.bgColor2) +
          '"/>' +
          "</linearGradient>"
      );
      return 'fill="url(#' + linearId + ')"';
    }

    return 'fill="' + escapeXml(settings.bgColor) + '"';
  }

  /**
   * SVG image elements need intrinsic pixel size for cover math.
   * Data URLs from our uploader are PNG; parse IHDR when possible, else assume square.
   */
  function guessDataUrlSize(dataUrl) {
    try {
      if (!dataUrl || dataUrl.indexOf("data:image/png;base64,") !== 0) {
        return { w: DESIGN_BASE, h: DESIGN_BASE };
      }
      var b64 = dataUrl.slice("data:image/png;base64,".length);
      var bin = atob(b64.slice(0, 96));
      // PNG signature (8) + IHDR length(4) + "IHDR"(4) + width(4) + height(4)
      if (bin.length < 24) {
        return { w: DESIGN_BASE, h: DESIGN_BASE };
      }
      function u32(i) {
        return (
          ((bin.charCodeAt(i) << 24) |
            (bin.charCodeAt(i + 1) << 16) |
            (bin.charCodeAt(i + 2) << 8) |
            bin.charCodeAt(i + 3)) >>>
          0
        );
      }
      return { w: u32(16) || DESIGN_BASE, h: u32(20) || DESIGN_BASE };
    } catch (e) {
      return { w: DESIGN_BASE, h: DESIGN_BASE };
    }
  }

  function buildImageElement(dataUrl, size, scalePct, posXPct, posYPct, opacityPct) {
    if (!dataUrl) {
      return "";
    }
    var dims = guessDataUrlSize(dataUrl);
    var rect = computeImageDrawRect(
      dims.w,
      dims.h,
      size,
      scalePct,
      posXPct,
      posYPct
    );
    var opacity = Math.max(0, Math.min(1, (Number(opacityPct) || 100) / 100));
    return (
      '<image href="' +
      escapeXml(dataUrl) +
      '" x="' +
      rect.x +
      '" y="' +
      rect.y +
      '" width="' +
      rect.w +
      '" height="' +
      rect.h +
      '" opacity="' +
      opacity +
      '" preserveAspectRatio="none"/>'
    );
  }

  function buildIconGlyph(settings, size, scale) {
    var paths = global.FONT_AWESOME_PATHS;
    if (!paths) {
      return "";
    }
    var icon = paths[settings.fontAwesome];
    if (!icon || !icon.path) {
      return "";
    }
    var fontSize = settings.fontSize * scale;
    var glyphWidth = icon.width || FA_UNITS;
    var s = fontSize / FA_UNITS;
    var transform =
      "translate(" +
      size / 2 +
      " " +
      size / 2 +
      ") scale(" +
      s +
      " " +
      -s +
      ") translate(" +
      -glyphWidth / 2 +
      " " +
      -FA_MID_Y +
      ")";
    return (
      '<path d="' +
      escapeXml(icon.path) +
      '" fill="' +
      escapeXml(settings.textColor) +
      '" transform="' +
      transform +
      '"/>'
    );
  }

  function buildTextGlyph(settings, size, scale) {
    var fontSize = settings.fontSize * scale;
    var weight = settings.textStyle1 ? "700" : "400";
    var style = settings.textStyle2 ? "italic" : "normal";
    var family = settings.fontFamily || "Montserrat";
    var text = String(settings.text == null ? "" : settings.text);
    var cx = size / 2;
    var cy = size / 2;
    var parts = [];
    parts.push(
      '<text x="' +
        cx +
        '" y="' +
        cy +
        '" text-anchor="middle" dominant-baseline="central" fill="' +
        escapeXml(settings.textColor) +
        '" font-family="' +
        escapeXml(family) +
        ', sans-serif" font-size="' +
        fontSize +
        '" font-weight="' +
        weight +
        '" font-style="' +
        style +
        '">' +
        escapeXml(text) +
        "</text>"
    );

    if (settings.textStyle3 || settings.textStyle4) {
      // Approximate text width for decoration lines (no canvas metrics in SVG builder).
      var approxWidth = Math.max(fontSize * 0.55 * Math.max(text.length, 1), fontSize * 0.4);
      var x0 = cx - approxWidth / 2;
      var x1 = cx + approxWidth / 2;
      var strokeW = Math.max(1, Math.round(fontSize * 0.06));
      if (settings.textStyle3) {
        var uy = cy + fontSize * 0.35;
        parts.push(
          '<line x1="' +
            x0 +
            '" y1="' +
            uy +
            '" x2="' +
            x1 +
            '" y2="' +
            uy +
            '" stroke="' +
            escapeXml(settings.textColor) +
            '" stroke-width="' +
            strokeW +
            '"/>'
        );
      }
      if (settings.textStyle4 && !settings.textStyle3) {
        parts.push(
          '<line x1="' +
            x0 +
            '" y1="' +
            cy +
            '" x2="' +
            x1 +
            '" y2="' +
            cy +
            '" stroke="' +
            escapeXml(settings.textColor) +
            '" stroke-width="' +
            strokeW +
            '"/>'
        );
      }
    }

    return parts.join("");
  }

  function renderToString(settings) {
    var normalized = normalizeSettings(settings);
    var size = DESIGN_BASE;
    var scale = size / 64;
    var radius = (normalized.borderRadius / 100) * size;
    var borderLive = normalized.border == Border.ENABLED;
    var borderW = borderLive ? normalized.borderWidth * scale : 0;
    var defs = [];
    var fillAttr = buildBackgroundFill(normalized, size, defs);
    var clipId = "fc-clip";

    defs.push(
      '<clipPath id="' +
        clipId +
        '"><rect x="0" y="0" width="' +
        size +
        '" height="' +
        size +
        '" rx="' +
        radius +
        '" ry="' +
        radius +
        '"/></clipPath>'
    );

    var styleBlock = "";
    if (
      normalized.fontType != FontType.FONT_AWESOME &&
      normalized.fontType != FontType.IMAGE &&
      normalized.fontFamily
    ) {
      styleBlock =
        "<style>@import url('https://fonts.googleapis.com/css?family=" +
        encodeURIComponent(normalized.fontFamily) +
        "');</style>";
    }

    var bgImageMarkup = "";
    if (normalized.bgType == BgType.IMAGE) {
      bgImageMarkup = buildImageElement(
        normalized.bgImage,
        size,
        normalized.bgImageScale,
        normalized.bgImagePosX,
        normalized.bgImagePosY,
        normalized.bgImageOpacity
      );
    }

    var glyph = "";
    if (normalized.fontType == FontType.IMAGE) {
      glyph = buildImageElement(
        normalized.visualImage,
        size,
        normalized.visualImageScale,
        normalized.visualImagePosX,
        normalized.visualImagePosY,
        normalized.visualImageOpacity
      );
    } else if (normalized.fontType == FontType.FONT_AWESOME) {
      glyph = buildIconGlyph(normalized, size, scale);
    } else {
      glyph = buildTextGlyph(normalized, size, scale);
    }

    var body =
      '<g clip-path="url(#' +
      clipId +
      ')">' +
      '<rect x="0" y="0" width="' +
      size +
      '" height="' +
      size +
      '" ' +
      fillAttr +
      "/>" +
      bgImageMarkup +
      glyph +
      "</g>";

    if (borderLive && borderW > 0) {
      var inset = borderW / 2;
      var strokeRadius = Math.max(0, radius - inset);
      body +=
        '<rect x="' +
        inset +
        '" y="' +
        inset +
        '" width="' +
        (size - borderW) +
        '" height="' +
        (size - borderW) +
        '" rx="' +
        strokeRadius +
        '" ry="' +
        strokeRadius +
        '" fill="none" stroke="' +
        escapeXml(normalized.borderColor) +
        '" stroke-width="' +
        borderW +
        '"/>';
    }

    return (
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 ' +
      size +
      " " +
      size +
      '">' +
      styleBlock +
      "<defs>" +
      defs.join("") +
      "</defs>" +
      body +
      "</svg>"
    );
  }

  global.FaviconSvg = {
    renderToString: renderToString,
  };
})(typeof window !== "undefined" ? window : self);
