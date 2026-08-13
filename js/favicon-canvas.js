/**
 * Draw favicons with Canvas2D / OffscreenCanvas from design settings.
 * Avoids DOM capture so small sizes stay sharp.
 */
(function (global) {
  var FontType = (global.FaviconSettings && global.FaviconSettings.FontType) || {
    TEXT: "1",
    FONT_AWESOME: "2",
  };
  var BgType = (global.FaviconSettings && global.FaviconSettings.BgType) || {
    SOLID: "1",
    GRADIENT: "2",
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

  var DESIGN_BASE = 64;
  var FA_UNITS = 1792;
  var FA_ASCENT = 1536;
  var FA_DESCENT = -256;
  var FA_MID_Y = (FA_ASCENT + FA_DESCENT) / 2;

  function normalizeSettings(settings) {
    settings = settings || {};
    return {
      fontType:
        settings.fontType != undefined ? settings.fontType : Defaults.fontType,
      text: settings.text != undefined ? settings.text : "F",
      fontAwesome:
        settings.fontAwesome != undefined
          ? settings.fontAwesome
          : "fa-thumbs-up",
      fontFamily: settings.fontFamily || "Montserrat",
      fontSize: Number(settings.fontSize != undefined ? settings.fontSize : 30),
      textColor: settings.textColor || "#FFFFFF",
      textStyle1: settings.textStyle1 === true,
      textStyle2: settings.textStyle2 === true,
      textStyle3: settings.textStyle3 === true,
      textStyle4: settings.textStyle4 === true,
      bgType: settings.bgType != undefined ? settings.bgType : Defaults.bgType,
      bgGradientType:
        settings.bgGradientType != undefined
          ? settings.bgGradientType
          : Defaults.bgGradientType,
      bgRadialShape:
        settings.bgRadialShape != undefined
          ? settings.bgRadialShape
          : Defaults.bgRadialShape,
      bgRadialPosition:
        settings.bgRadialPosition != undefined
          ? settings.bgRadialPosition
          : Defaults.bgRadialPosition,
      bgColor: settings.bgColor || "#FE145B",
      bgColor2: settings.bgColor2 || "#000000",
      bgDegrees: Number(
        settings.bgDegrees != undefined ? settings.bgDegrees : 90
      ),
      borderRadius: Number(
        settings.borderRadius != undefined ? settings.borderRadius : 0
      ),
      border: settings.border != undefined ? settings.border : Defaults.border,
      borderColor: settings.borderColor || "#000000",
      borderWidth: Number(
        settings.borderWidth != undefined
          ? settings.borderWidth
          : Defaults.borderWidth
      ),
    };
  }

  function createSurface(sizePx) {
    var size = Math.max(1, Math.round(sizePx));
    // Prefer HTMLCanvasElement in pages so toDataURL stays sync/simple.
    // OffscreenCanvas is for worker-like contexts without document.
    if (typeof document !== "undefined" && document.createElement) {
      var canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      return canvas;
    }
    if (typeof OffscreenCanvas !== "undefined") {
      return new OffscreenCanvas(size, size);
    }
    throw new Error("No canvas surface available");
  }

  function roundRectPath(ctx, x, y, w, h, radius) {
    var r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
    ctx.beginPath();
    if (r <= 0) {
      ctx.rect(x, y, w, h);
      return;
    }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
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
    // CSS angles: 0deg = to top, 90deg = to right.
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

  function createBackground(ctx, settings, size) {
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

        if (isEllipse) {
          var ratio = 0.75;
          ctx.save();
          ctx.translate(center.x, center.y);
          ctx.scale(1, ratio);
          var ellipseGrad = ctx.createRadialGradient(
            0,
            0,
            0,
            0,
            0,
            coverRadius
          );
          ellipseGrad.addColorStop(0, settings.bgColor);
          ellipseGrad.addColorStop(0.78, settings.bgColor2);
          ctx.fillStyle = ellipseGrad;
          var inv = 1 / ratio;
          ctx.fillRect(-size * 2, -size * 2 * inv, size * 4, size * 4 * inv);
          ctx.restore();
          return;
        }

        var grad = ctx.createRadialGradient(
          center.x,
          center.y,
          0,
          center.x,
          center.y,
          coverRadius
        );
        grad.addColorStop(0, settings.bgColor);
        grad.addColorStop(0.78, settings.bgColor2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        return;
      }

      var ends = linearGradientEndpoints(size, settings.bgDegrees);
      var linear = ctx.createLinearGradient(ends.x0, ends.y0, ends.x1, ends.y1);
      linear.addColorStop(0, settings.bgColor);
      linear.addColorStop(0.78, settings.bgColor2);
      ctx.fillStyle = linear;
      ctx.fillRect(0, 0, size, size);
      return;
    }

    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, size, size);
  }

  function waitForFonts(settings) {
    if (settings.fontType == FontType.FONT_AWESOME) {
      return Promise.resolve();
    }
    if (!document.fonts || !document.fonts.load) {
      return Promise.resolve();
    }
    var weight = settings.textStyle1 ? "700" : "400";
    var style = settings.textStyle2 ? "italic" : "normal";
    var family = settings.fontFamily || "Montserrat";
    var size = Math.max(1, settings.fontSize);
    var spec = style + " " + weight + " " + size + 'px "' + family + '"';
    return document.fonts
      .load(spec)
      .then(function () {
        return document.fonts.ready;
      })
      .catch(function () {
        return undefined;
      });
  }

  function drawTextGlyph(ctx, settings, size, scale) {
    var fontSize = settings.fontSize * scale;
    if (size <= 32) {
      fontSize = Math.round(fontSize);
    }
    var weight = settings.textStyle1 ? "700" : "400";
    var style = settings.textStyle2 ? "italic" : "normal";
    var family = settings.fontFamily || "Montserrat";
    ctx.fillStyle = settings.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = style + " " + weight + " " + fontSize + 'px "' + family + '"';
    var text = String(settings.text == null ? "" : settings.text);
    var cx = size / 2;
    var cy = size / 2;
    ctx.fillText(text, cx, cy);

    if (settings.textStyle3 || settings.textStyle4) {
      var metrics = ctx.measureText(text);
      var textWidth = metrics.width;
      var x0 = cx - textWidth / 2;
      var x1 = cx + textWidth / 2;
      ctx.strokeStyle = settings.textColor;
      ctx.lineWidth = Math.max(1, Math.round(fontSize * 0.06));
      ctx.beginPath();
      if (settings.textStyle3) {
        var uy =
          cy +
          (metrics.actualBoundingBoxDescent != null
            ? metrics.actualBoundingBoxDescent * 0.85
            : fontSize * 0.35);
        ctx.moveTo(x0, uy);
        ctx.lineTo(x1, uy);
      }
      if (settings.textStyle4 && !settings.textStyle3) {
        ctx.moveTo(x0, cy);
        ctx.lineTo(x1, cy);
      }
      ctx.stroke();
    }
  }

  function drawIconGlyph(ctx, settings, size, scale) {
    var paths = global.FONT_AWESOME_PATHS;
    if (!paths) {
      return;
    }
    var icon = paths[settings.fontAwesome];
    if (!icon || !icon.path) {
      return;
    }
    var fontSize = settings.fontSize * scale;
    if (size <= 32) {
      fontSize = Math.round(fontSize);
    }
    var glyphWidth = icon.width || FA_UNITS;
    var path = new Path2D(icon.path);
    ctx.save();
    ctx.fillStyle = settings.textColor;
    ctx.translate(size / 2, size / 2);
    var s = fontSize / FA_UNITS;
    ctx.scale(s, -s);
    ctx.translate(-glyphWidth / 2, -FA_MID_Y);
    ctx.fill(path);
    ctx.restore();
  }

  function drawFavicon(ctx, settings, size, options) {
    options = options || {};
    var scale = size / DESIGN_BASE;
    // CSS border-radius % is relative to the box side (not half-side).
    var radius = (settings.borderRadius / 100) * size;
    var borderLive = settings.border == Border.ENABLED;
    var borderW = borderLive ? settings.borderWidth * scale : 0;
    if (size <= 32 && borderLive) {
      borderW = Math.max(1, Math.round(borderW));
    }

    if (options.opaqueBackdrop) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size, size);
    } else {
      ctx.clearRect(0, 0, size, size);
    }

    roundRectPath(ctx, 0, 0, size, size, radius);
    ctx.save();
    ctx.clip();

    createBackground(ctx, settings, size);

    if (settings.fontType == FontType.FONT_AWESOME) {
      drawIconGlyph(ctx, settings, size, scale);
    } else {
      drawTextGlyph(ctx, settings, size, scale);
    }

    ctx.restore();

    if (borderLive && borderW > 0) {
      var inset = borderW / 2;
      roundRectPath(
        ctx,
        inset,
        inset,
        size - borderW,
        size - borderW,
        Math.max(0, radius - inset)
      );
      ctx.strokeStyle = settings.borderColor;
      ctx.lineWidth = borderW;
      ctx.stroke();
    }
  }

  function normalizeMime(mime) {
    if (!mime) {
      return "image/png";
    }
    var m = String(mime).toLowerCase();
    if (m === "jpg" || m === "jpeg" || m === "image/jpg" || m === "image/jpeg") {
      return "image/jpeg";
    }
    if (m === "png" || m === "image/png") {
      return "image/png";
    }
    return m.indexOf("image/") === 0 ? m : "image/png";
  }

  function canvasToDataURL(canvas, mime) {
    mime = normalizeMime(mime);
    if (typeof canvas.toDataURL === "function") {
      if (mime === "image/jpeg") {
        return Promise.resolve(canvas.toDataURL(mime, 0.92));
      }
      return Promise.resolve(canvas.toDataURL(mime));
    }
    if (typeof canvas.convertToBlob === "function") {
      var opts =
        mime === "image/jpeg" ? { type: mime, quality: 0.92 } : { type: mime };
      return canvas.convertToBlob(opts).then(function (blob) {
        return new Promise(function (resolve, reject) {
          var reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
    }
    return Promise.reject(new Error("Canvas encoding is not supported"));
  }

  function renderCanvas(settings, sizePx, mime) {
    var normalized = normalizeSettings(settings);
    var size = Math.max(1, Math.round(sizePx));
    var type = normalizeMime(mime);

    return waitForFonts(normalized).then(function () {
      var canvas = createSurface(size);
      var ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get 2D context");
      }

      drawFavicon(ctx, normalized, size, {
        opaqueBackdrop: type === "image/jpeg",
      });
      return canvas;
    });
  }

  function renderToDataURL(settings, sizePx, mime) {
    return renderCanvas(settings, sizePx, mime).then(function (canvas) {
      return canvasToDataURL(canvas, mime);
    });
  }

  function renderToBase64(settings, sizePx, mime) {
    return renderToDataURL(settings, sizePx, mime).then(function (dataUrl) {
      var comma = dataUrl.indexOf(",");
      return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    });
  }

  global.FaviconCanvas = {
    renderToDataURL: renderToDataURL,
    renderToBase64: renderToBase64,
    normalizeSettings: normalizeSettings,
  };
})(typeof window !== "undefined" ? window : self);
