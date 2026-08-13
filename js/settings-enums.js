/**
 * Named constants for chrome.storage design settings.
 * Values stay as the existing persisted strings/numbers so history and
 * user storage remain compatible.
 */
(function (global) {
  var FontType = Object.freeze({
    TEXT: "1",
    FONT_AWESOME: "2",
  });

  var BgType = Object.freeze({
    SOLID: "1",
    GRADIENT: "2",
  });

  var BgGradientType = Object.freeze({
    LINEAR: "1",
    RADIAL: "2",
  });

  var Border = Object.freeze({
    ENABLED: "1",
    DISABLED: "2",
  });

  var RadialShape = Object.freeze({
    CIRCLE: "circle",
    ELLIPSE: "ellipse",
  });

  var FileType = Object.freeze({
    PNG: 1,
    JPG: 2,
  });

  var FileOption = Object.freeze({
    ENABLED: 1,
    DISABLED: 2,
  });

  var Defaults = Object.freeze({
    fontType: FontType.TEXT,
    bgType: BgType.SOLID,
    bgGradientType: BgGradientType.LINEAR,
    bgRadialShape: RadialShape.CIRCLE,
    bgRadialPosition: "center",
    border: Border.DISABLED,
    borderWidth: "1",
    fileType: FileType.PNG,
    fileHtml: FileOption.DISABLED,
    fileReadMe: FileOption.DISABLED,
    fileSvg: FileOption.ENABLED,
    fileIco: FileOption.ENABLED,
    fileApple: FileOption.ENABLED,
    fileManifest: FileOption.ENABLED,
  });

  global.FaviconSettings = Object.freeze({
    FontType: FontType,
    BgType: BgType,
    BgGradientType: BgGradientType,
    Border: Border,
    RadialShape: RadialShape,
    FileType: FileType,
    FileOption: FileOption,
    Defaults: Defaults,
  });
})(typeof window !== "undefined" ? window : self);
