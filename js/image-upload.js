/**
 * Normalize user-selected images for favicon design storage.
 */
(function (global) {
  var MAX_EDGE = 256;
  var ALLOWED = {
    "image/png": true,
    "image/jpeg": true,
    "image/jpg": true,
    "image/webp": true,
  };

  function isAllowedMime(mime) {
    return !!ALLOWED[String(mime || "").toLowerCase()];
  }

  function isAllowedFile(file) {
    if (!file) {
      return false;
    }
    if (file.type && isAllowedMime(file.type)) {
      return true;
    }
    var name = String(file.name || "").toLowerCase();
    return (
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".webp")
    );
  }

  function loadImageFromFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          resolve(img);
        };
        img.onerror = function () {
          reject(new Error("Could not read that image."));
        };
        img.src = reader.result;
      };
      reader.onerror = function () {
        reject(new Error("Could not read that file."));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * @param {File} file
   * @returns {Promise<string>} PNG data URL (max edge 256)
   */
  function fileToNormalizedDataUrl(file) {
    if (!file) {
      return Promise.reject(new Error("No file selected."));
    }
    if (!isAllowedFile(file)) {
      return Promise.reject(
        new Error("Please choose a PNG, JPEG, or WebP image.")
      );
    }

    return loadImageFromFile(file).then(function (img) {
      var w = img.naturalWidth || img.width || 1;
      var h = img.naturalHeight || img.height || 1;
      var scale = Math.min(1, MAX_EDGE / Math.max(w, h));
      var outW = Math.max(1, Math.round(w * scale));
      var outH = Math.max(1, Math.round(h * scale));
      var canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      var ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not process that image.");
      }
      ctx.drawImage(img, 0, 0, outW, outH);
      return canvas.toDataURL("image/png");
    });
  }

  global.FaviconImageUpload = Object.freeze({
    MAX_EDGE: MAX_EDGE,
    ACCEPT: "image/png,image/jpeg,image/webp",
    isAllowedFile: isAllowedFile,
    fileToNormalizedDataUrl: fileToNormalizedDataUrl,
  });
})(typeof window !== "undefined" ? window : self);
