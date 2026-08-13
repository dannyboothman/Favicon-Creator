/**
 * Build a multi-size .ico file from PNG image buffers (PNG-in-ICO).
 */
(function (global) {
  function toUint8Array(data) {
    if (data instanceof Uint8Array) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    if (typeof data === "string") {
      // base64
      var binary = atob(data);
      var out = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) {
        out[i] = binary.charCodeAt(i);
      }
      return out;
    }
    throw new Error("Unsupported PNG buffer type");
  }

  function writeUint16LE(view, offset, value) {
    view.setUint16(offset, value, true);
  }

  function writeUint32LE(view, offset, value) {
    view.setUint32(offset, value, true);
  }

  /**
   * @param {Array<{width:number,height:number,png:ArrayBuffer|Uint8Array|string}>} images
   * @returns {Uint8Array}
   */
  function buildFromPngImages(images) {
    if (!images || !images.length) {
      throw new Error("ICO requires at least one PNG image");
    }

    var entries = [];
    var i;
    for (i = 0; i < images.length; i++) {
      entries.push({
        width: Math.max(1, Math.round(images[i].width)),
        height: Math.max(1, Math.round(images[i].height)),
        png: toUint8Array(images[i].png),
      });
    }

    var headerSize = 6;
    var dirEntrySize = 16;
    var offset = headerSize + dirEntrySize * entries.length;
    var totalSize = offset;
    for (i = 0; i < entries.length; i++) {
      totalSize += entries[i].png.length;
    }

    var buffer = new ArrayBuffer(totalSize);
    var view = new DataView(buffer);
    var bytes = new Uint8Array(buffer);

    writeUint16LE(view, 0, 0); // reserved
    writeUint16LE(view, 2, 1); // type = icon
    writeUint16LE(view, 4, entries.length);

    var dataOffset = offset;
    for (i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var dirOffset = headerSize + i * dirEntrySize;
      bytes[dirOffset] = entry.width >= 256 ? 0 : entry.width;
      bytes[dirOffset + 1] = entry.height >= 256 ? 0 : entry.height;
      bytes[dirOffset + 2] = 0; // color count
      bytes[dirOffset + 3] = 0; // reserved
      writeUint16LE(view, dirOffset + 4, 1); // planes
      writeUint16LE(view, dirOffset + 6, 32); // bit count
      writeUint32LE(view, dirOffset + 8, entry.png.length);
      writeUint32LE(view, dirOffset + 12, dataOffset);
      bytes.set(entry.png, dataOffset);
      dataOffset += entry.png.length;
    }

    return bytes;
  }

  /**
   * Convenience: build ICO from base64 PNG strings at given sizes.
   * @param {Array<{width:number,height:number,base64:string}>} images
   * @returns {Uint8Array}
   */
  function buildFromBase64Pngs(images) {
    return buildFromPngImages(
      (images || []).map(function (img) {
        return {
          width: img.width,
          height: img.height,
          png: img.base64,
        };
      })
    );
  }

  global.FaviconIco = {
    buildFromPngImages: buildFromPngImages,
    buildFromBase64Pngs: buildFromBase64Pngs,
  };
})(typeof window !== "undefined" ? window : self);
