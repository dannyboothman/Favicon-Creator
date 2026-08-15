document.addEventListener("partialsLoaded", function () {
  var FontType = FaviconSettings.FontType;
  var BgType = FaviconSettings.BgType;
  var BgGradientType = FaviconSettings.BgGradientType;
  var Border = FaviconSettings.Border;
  var RadialShape = FaviconSettings.RadialShape;

  var currentSettings = FaviconDesign.buildDesignSettings({});
  var persistTimer = null;
  var persistPending = {};
  var PERSIST_DEBOUNCE_MS = 150;

  /* Favicon Tabs */
  var fEditTab1 = document.getElementById("favicon_tab1");
  var fEditTab2 = document.getElementById("favicon_tab2");
  var fEditTab3 = document.getElementById("favicon_tab3");
  var fEditTabContainer1 = document.getElementById("favicon_edit_container1");
  var fEditTabContainer2 = document.getElementById("favicon_edit_container2");
  var fEditTabContainer3 = document.getElementById("favicon_edit_container3");
  var fEditTabs = [fEditTab1, fEditTab2, fEditTab3];
  var fEditTabPanels = [
    fEditTabContainer1,
    fEditTabContainer2,
    fEditTabContainer3,
  ];

  function selectFaviconTab(tabIndex, options) {
    options = options || {};
    for (var i = 0; i < fEditTabs.length; i++) {
      var selected = i + 1 === tabIndex;
      fEditTabs[i].classList.toggle("favicon_tab_active", selected);
      fEditTabs[i].setAttribute("aria-selected", selected ? "true" : "false");
      fEditTabs[i].tabIndex = selected ? 0 : -1;
      fEditTabPanels[i].style.display = selected ? "block" : "none";
      fEditTabPanels[i].hidden = !selected;
    }
    if (options.focus) {
      fEditTabs[tabIndex - 1].focus();
    }
    if (options.persist !== false) {
      FaviconStorage.set({ tab: String(tabIndex) });
    }
  }

  fEditTab1.addEventListener("click", function () {
    selectFaviconTab(1);
  });

  fEditTab2.addEventListener("click", function () {
    selectFaviconTab(2);
  });

  fEditTab3.addEventListener("click", function () {
    selectFaviconTab(3);
  });

  document
    .getElementById("favicon_tab_container")
    .addEventListener("keydown", function (event) {
      var currentIndex = fEditTabs.indexOf(document.activeElement);
      if (currentIndex === -1) {
        return;
      }

      var nextIndex = currentIndex;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % fEditTabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + fEditTabs.length) % fEditTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = fEditTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      selectFaviconTab(nextIndex + 1, { focus: true });
    });

  /* Favicon Display */
  var fDisplay1;
  var fDisplay2;
  var faviconCreated = false;

  function ensurePreviewDom() {
    if (faviconCreated) {
      return;
    }
    faviconCreated = true;

    var faviconHtml = "";
    faviconHtml += '<div id="favicon_display">';
    faviconHtml += '<div id="favicon_display_content"></div>';
    faviconHtml += "</div>";

    document.getElementById("favicon_display_container").innerHTML =
      faviconHtml;

    fDisplay1 = document.getElementById("favicon_display");
    fDisplay2 = document.getElementById("favicon_display_content");
  }

  function applyPreview() {
    ensurePreviewDom();
    FaviconDesign.applyPreviewStyles(fDisplay1, fDisplay2, currentSettings, {
      googleFontStylesheetId: "googleFontStylesheet",
    });
    if (
      typeof previewFaviconInActiveTab === "function" &&
      typeof FaviconCanvas !== "undefined"
    ) {
      previewFaviconInActiveTab(
        FaviconCanvas.normalizeSettings(currentSettings),
      );
    }
  }

  function assignSettings(partial) {
    Object.keys(partial).forEach(function (key) {
      currentSettings[key] = partial[key];
    });
  }

  function persist(partial, options) {
    options = options || {};
    assignSettings(partial);
    if (options.debounce) {
      Object.keys(partial).forEach(function (key) {
        persistPending[key] = partial[key];
      });
      clearTimeout(persistTimer);
      persistTimer = setTimeout(function () {
        var payload = persistPending;
        persistPending = {};
        FaviconStorage.set(payload);
      }, PERSIST_DEBOUNCE_MS);
    } else {
      FaviconStorage.set(partial);
    }
    if (options.preview !== false) {
      applyPreview();
    }
  }

  window.addEventListener("pagehide", function () {
    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }
    var keys = Object.keys(persistPending);
    if (keys.length) {
      var payload = persistPending;
      persistPending = {};
      FaviconStorage.set(payload);
    }
  });

  /* Favicon Type Nav */
  var fEditType1 = document.getElementById("favicon_edit_type1");
  var fEditType2 = document.getElementById("favicon_edit_type2");
  var fEditType3 = document.getElementById("favicon_edit_type3");
  var fEditType1Container = document.getElementById("favicon_edit_type_text");
  var fEditType2Container = document.getElementById(
    "favicon_edit_type_fontawesome",
  );
  var fEditType3Container = document.getElementById("favicon_edit_type_image");
  var fEditGlyphControls = document.getElementById(
    "favicon_edit_glyph_controls",
  );
  var fEditTextColorContainer = document.getElementById(
    "favicon_edit_text_color_container",
  );
  var fEditTextStyles = document.getElementById("favicon_edit_text_styles");

  function setTextStylesHidden(hidden) {
    fEditTextStyles.style.display = hidden ? "none" : "block";
    fEditTextColorContainer.classList.toggle("input_container_50", !hidden);
  }

  function setVisualTypeUi(fontType) {
    var isText = fontType == FontType.TEXT;
    var isFa = fontType == FontType.FONT_AWESOME;
    var isImage = fontType == FontType.IMAGE;

    fEditType1.checked = isText;
    fEditType2.checked = isFa;
    fEditType3.checked = isImage;

    fEditType1Container.style.display = isText ? "block" : "none";
    fEditType2Container.style.display = isFa ? "block" : "none";
    fEditType3Container.style.display = isImage ? "block" : "none";
    fEditGlyphControls.style.display = isImage ? "none" : "block";
    setTextStylesHidden(isFa || isImage);
  }

  fEditType1.addEventListener("click", function () {
    setVisualTypeUi(FontType.TEXT);
    persist({ fontType: FontType.TEXT });
  });

  fEditType2.addEventListener("click", function () {
    setVisualTypeUi(FontType.FONT_AWESOME);
    setFontAwesomeButton(currentSettings.fontAwesome);
    persist({ fontType: FontType.FONT_AWESOME });
  });

  fEditType3.addEventListener("click", function () {
    setVisualTypeUi(FontType.IMAGE);
    persist({ fontType: FontType.IMAGE });
  });

  /* End of Favicon Type Nav */

  /* Favicon Background Nav */
  var fBackgroundType1 = document.getElementById(
    "favicon_edit_background_type_solid",
  );
  var fBackgroundType2 = document.getElementById(
    "favicon_edit_background_type_gradient",
  );
  var fBackgroundType3 = document.getElementById(
    "favicon_edit_background_type_image",
  );
  var fBackgroundColorRow = document.getElementById(
    "favicon_edit_background_color_row",
  );
  var fBackgroundType2Container1 = document.getElementById(
    "favicon_edit_background_type_gradient_container",
  );
  var fBackgroundType2Container2 = document.getElementById(
    "favicon_edit_background_type_gradient_container2",
  );
  var fBackgroundType3Container = document.getElementById(
    "favicon_edit_background_type_image_container",
  );
  var fGradientTypeLinear = document.getElementById(
    "favicon_edit_background_type_gradient_type_linear",
  );
  var fGradientTypeRadial = document.getElementById(
    "favicon_edit_background_type_gradient_type_radial",
  );
  var fEditBgDegreesContainer = document.getElementById(
    "favicon_edit_linear_degs_container",
  );
  var fEditRadialOptionsContainer = document.getElementById(
    "favicon_edit_radial_options_container",
  );
  var fRadialShapeCircle = document.getElementById(
    "favicon_edit_radial_shape_circle",
  );
  var fRadialShapeEllipse = document.getElementById(
    "favicon_edit_radial_shape_ellipse",
  );
  var fEditRadialPosition = document.getElementById(
    "favicon_edit_radial_position",
  );

  function updateGradientTypeUi() {
    if (currentSettings.bgGradientType == BgGradientType.RADIAL) {
      fGradientTypeRadial.checked = true;
      fEditBgDegreesContainer.style.display = "none";
      fEditRadialOptionsContainer.style.display = "block";
      if (currentSettings.bgRadialShape == RadialShape.ELLIPSE) {
        fRadialShapeEllipse.checked = true;
      } else {
        fRadialShapeCircle.checked = true;
      }
      fEditRadialPosition.value = currentSettings.bgRadialPosition;
    } else {
      fGradientTypeLinear.checked = true;
      fEditBgDegreesContainer.style.display = "block";
      fEditRadialOptionsContainer.style.display = "none";
    }
  }

  function setBackgroundTypeUi(bgType) {
    var isSolid = bgType == BgType.SOLID;
    var isGradient = bgType == BgType.GRADIENT;
    var isImage = bgType == BgType.IMAGE;

    fBackgroundType1.checked = isSolid;
    fBackgroundType2.checked = isGradient;
    fBackgroundType3.checked = isImage;

    fBackgroundColorRow.style.display = isImage ? "none" : "block";
    fBackgroundType2Container1.style.display = isGradient ? "block" : "none";
    fBackgroundType2Container2.style.display = isGradient ? "block" : "none";
    fBackgroundType3Container.style.display = isImage ? "block" : "none";

    if (isGradient) {
      updateGradientTypeUi();
    }
  }

  fBackgroundType1.addEventListener("click", function () {
    setBackgroundTypeUi(BgType.SOLID);
    persist({ bgType: BgType.SOLID });
  });

  fBackgroundType2.addEventListener("click", function () {
    setBackgroundTypeUi(BgType.GRADIENT);
    persist({ bgType: BgType.GRADIENT });
  });

  fBackgroundType3.addEventListener("click", function () {
    setBackgroundTypeUi(BgType.IMAGE);
    persist({ bgType: BgType.IMAGE });
  });

  fGradientTypeLinear.addEventListener("click", function () {
    persist({ bgGradientType: BgGradientType.LINEAR }, { preview: false });
    updateGradientTypeUi();
    applyPreview();
  });

  fGradientTypeRadial.addEventListener("click", function () {
    persist({ bgGradientType: BgGradientType.RADIAL }, { preview: false });
    updateGradientTypeUi();
    applyPreview();
  });

  fRadialShapeCircle.addEventListener("click", function () {
    persist({ bgRadialShape: RadialShape.CIRCLE });
  });

  fRadialShapeEllipse.addEventListener("click", function () {
    persist({ bgRadialShape: RadialShape.ELLIPSE });
  });

  fEditRadialPosition.addEventListener("change", function () {
    persist({ bgRadialPosition: fEditRadialPosition.value });
  });

  /* End of Favicon Background Nav */

  /* Var input set */
  var fEditTextColor = document.getElementById("favicon_edit_text_color");
  var fEditBgColor = document.getElementById("favicon_edit_bg_color");
  var fEditBgColor2 = document.getElementById("favicon_edit_bg_color2");
  var fEditBgDegrees = document.getElementById("favicon_edit_linear_degs");
  var fEditBgDegreesText = document.getElementById(
    "favicon_edit_linear_degs_text",
  );
  var fEditSize = document.getElementById("favicon_edit_font_size");
  var fEditSizeText = document.getElementById("favicon_edit_font_size_text");
  var fEditBorderRadius = document.getElementById("favicon_edit_border_radius");
  var fEditBorderRadiusText = document.getElementById(
    "favicon_edit_border_radius_text",
  );
  var fEditText = document.getElementById("favicon_edit_text");
  var fEditTextStyle1 = document.getElementById(
    "favicon_edit_text_style_item_bold",
  );
  var fEditTextStyle2 = document.getElementById(
    "favicon_edit_text_style_item_italic",
  );
  var fEditTextStyle3 = document.getElementById(
    "favicon_edit_text_style_item_underline",
  );
  var fEditTextStyle4 = document.getElementById(
    "favicon_edit_text_style_item_strike",
  );
  var fEditGoogleFont = document.getElementById("favicon_edit_google_font");
  var fEditBorderContainer = document.getElementById(
    "favicon_edit_border_container",
  );
  var fEditBorderEnabled = document.getElementById("favicon_edit_border1");
  var fEditBorderDisabled = document.getElementById("favicon_edit_border2");
  var fEditBorderColor = document.getElementById("favicon_edit_border_color");
  var fEditBorderWidth = document.getElementById("favicon_edit_border_width");
  var fEditBorderWidthText = document.getElementById(
    "favicon_edit_border_width_text",
  );
  /* End of Var input set  */

  function setTextStylePressed(el, pressed) {
    el.classList.toggle("favicon_edit_text_style_item_selected", pressed);
    el.setAttribute("aria-pressed", pressed ? "true" : "false");
  }

  /* Text Color */
  fEditTextColor.addEventListener("input", function () {
    persist({ textColor: fEditTextColor.value });
  });
  /* End of Text Color */

  /* BG Color */
  fEditBgColor.addEventListener("input", function () {
    persist({ bgColor: fEditBgColor.value });
  });
  fEditBgColor2.addEventListener("input", function () {
    persist({ bgColor2: fEditBgColor2.value });
  });

  /* Degrees */
  fEditBgDegrees.addEventListener("input", function () {
    fEditBgDegreesText.innerText = fEditBgDegrees.value;
    persist({ bgDegrees: fEditBgDegrees.value }, { debounce: true });
  });
  /* End of BG Color */

  /* Font Size */
  fEditSize.addEventListener("input", function () {
    fEditSizeText.innerHTML = "(" + fEditSize.value + "px)";
    persist({ fontSize: fEditSize.value }, { debounce: true });
  });
  /* End of Font Size */

  /* Border Radius */
  fEditBorderRadius.addEventListener("input", function () {
    fEditBorderRadiusText.innerHTML = "(" + fEditBorderRadius.value + "%)";
    persist({ borderRadius: fEditBorderRadius.value }, { debounce: true });
  });
  /* End of Border Radius */

  /* Text */
  fEditText.addEventListener("input", function () {
    persist({ text: fEditText.value });
  });
  /* End of Text */

  /* Text Style: Bold */
  fEditTextStyle1.addEventListener("click", function () {
    var on = !fEditTextStyle1.classList.contains(
      "favicon_edit_text_style_item_selected",
    );
    setTextStylePressed(fEditTextStyle1, on);
    persist({ textStyle1: on });
  });
  /* End Text Style: Bold */

  /* Text Style: Italic */
  fEditTextStyle2.addEventListener("click", function () {
    var on = !fEditTextStyle2.classList.contains(
      "favicon_edit_text_style_item_selected",
    );
    setTextStylePressed(fEditTextStyle2, on);
    persist({ textStyle2: on });
  });
  /* End Text Style: Italic */

  /* Text Style: Underline */
  fEditTextStyle3.addEventListener("click", function () {
    var on = !fEditTextStyle3.classList.contains(
      "favicon_edit_text_style_item_selected",
    );
    setTextStylePressed(fEditTextStyle3, on);
    if (on) {
      setTextStylePressed(fEditTextStyle4, false);
      persist({ textStyle3: true, textStyle4: false });
    } else {
      persist({ textStyle3: false });
    }
  });
  /* End Text Style: Underline */

  /* Text Style: Strike */
  fEditTextStyle4.addEventListener("click", function () {
    var on = !fEditTextStyle4.classList.contains(
      "favicon_edit_text_style_item_selected",
    );
    setTextStylePressed(fEditTextStyle4, on);
    if (on) {
      setTextStylePressed(fEditTextStyle3, false);
      persist({ textStyle4: true, textStyle3: false });
    } else {
      persist({ textStyle4: false });
    }
  });
  /* End Text Style: Strike */

  /* Google Fonts */
  fEditGoogleFont.addEventListener("change", function () {
    persist({ fontFamily: fEditGoogleFont.value });
  });

  fEditGoogleFont.innerHTML = GOOGLE_FONTS.map(function (family) {
    return '<option value="' + family + '">' + family + "</option>";
  }).join("");
  /* End of Google Fonts */

  /* Font Awesome */

  var fontAwesomeButton = document.getElementById(
    "favicon_edit_font_awesome_button",
  );
  var fontAwesomeContainer = document.getElementById(
    "favicon_edit_font_awesome",
  );

  function formatFontAwesomeLabel(icon) {
    return icon
      .replace(/^fa-/, "")
      .split("-")
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function setFontAwesomeOpen(open) {
    fontAwesomeContainer.classList.toggle(
      "favicon_edit_font_awesome_active",
      open,
    );
    fontAwesomeButton.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setFontAwesomeButton(icon) {
    fontAwesomeButton.innerHTML =
      "<i class='fa " +
      icon +
      "'></i>" +
      formatFontAwesomeLabel(icon) +
      " <i class='fa fa-caret-down'></i>";
  }

  for (var i = 0; i < FONT_AWESOME_ICONS.length; i++) {
    var icon = FONT_AWESOME_ICONS[i];
    var li = document.createElement("li");
    li.setAttribute("data-icon", icon);
    li.setAttribute("role", "option");
    li.innerHTML =
      '<i class="fa ' +
      icon +
      '"></i> <span>' +
      formatFontAwesomeLabel(icon) +
      "</span>";
    fontAwesomeContainer.appendChild(li);
  }

  fontAwesomeButton.addEventListener("click", function (event) {
    event.stopPropagation();
    var open = !fontAwesomeContainer.classList.contains(
      "favicon_edit_font_awesome_active",
    );
    setFontAwesomeOpen(open);
  });

  fontAwesomeContainer.addEventListener("click", function (e) {
    var item = e.target.closest("li");
    if (item && fontAwesomeContainer.contains(item)) {
      var selectedIcon = item.getAttribute("data-icon");
      setFontAwesomeButton(selectedIcon);
      persist({ fontAwesome: selectedIcon });
      setTimeout(function () {
        setFontAwesomeOpen(false);
      }, 150);
    }
  });

  document.addEventListener("click", function (event) {
    if (
      fontAwesomeContainer.contains(event.target) ||
      fontAwesomeButton.contains(event.target)
    ) {
      return;
    }
    setFontAwesomeOpen(false);
  });

  function setBorderUi(enabled) {
    fEditBorderEnabled.classList.toggle(
      "favicon_edit_border_item_active",
      enabled,
    );
    fEditBorderDisabled.classList.toggle(
      "favicon_edit_border_item_active",
      !enabled,
    );
    fEditBorderEnabled.setAttribute("aria-pressed", enabled ? "true" : "false");
    fEditBorderDisabled.setAttribute(
      "aria-pressed",
      enabled ? "false" : "true",
    );
    fEditBorderContainer.style.display = enabled ? "block" : "none";
  }

  fEditBorderEnabled.addEventListener("click", function () {
    setBorderUi(true);
    persist({ border: Border.ENABLED });
  });

  fEditBorderDisabled.addEventListener("click", function () {
    setBorderUi(false);
    persist({ border: Border.DISABLED });
  });

  fEditBorderColor.addEventListener("input", function () {
    persist({ borderColor: fEditBorderColor.value });
  });

  fEditBorderWidth.addEventListener("input", function () {
    fEditBorderWidthText.innerHTML = "(" + fEditBorderWidth.value + "px)";
    persist({ borderWidth: fEditBorderWidth.value }, { debounce: true });
  });

  /* Image uploads + transforms */
  var fVisualImageInput = document.getElementById("favicon_edit_visual_image");
  var fVisualImageError = document.getElementById(
    "favicon_edit_visual_image_error",
  );
  var fVisualImageThumb = document.getElementById(
    "favicon_edit_visual_image_thumb",
  );
  var fVisualImageRemove = document.getElementById(
    "favicon_edit_visual_image_remove",
  );
  var fVisualImageScale = document.getElementById(
    "favicon_edit_visual_image_scale",
  );
  var fVisualImageScaleText = document.getElementById(
    "favicon_edit_visual_image_scale_text",
  );
  var fVisualImagePosX = document.getElementById(
    "favicon_edit_visual_image_pos_x",
  );
  var fVisualImagePosXText = document.getElementById(
    "favicon_edit_visual_image_pos_x_text",
  );
  var fVisualImagePosY = document.getElementById(
    "favicon_edit_visual_image_pos_y",
  );
  var fVisualImagePosYText = document.getElementById(
    "favicon_edit_visual_image_pos_y_text",
  );
  var fVisualImageOpacity = document.getElementById(
    "favicon_edit_visual_image_opacity",
  );
  var fVisualImageOpacityText = document.getElementById(
    "favicon_edit_visual_image_opacity_text",
  );

  var fBgImageInput = document.getElementById("favicon_edit_bg_image");
  var fBgImageError = document.getElementById("favicon_edit_bg_image_error");
  var fBgImageThumb = document.getElementById("favicon_edit_bg_image_thumb");
  var fBgImageRemove = document.getElementById("favicon_edit_bg_image_remove");
  var fBgImageScale = document.getElementById("favicon_edit_bg_image_scale");
  var fBgImageScaleText = document.getElementById(
    "favicon_edit_bg_image_scale_text",
  );
  var fBgImagePosX = document.getElementById("favicon_edit_bg_image_pos_x");
  var fBgImagePosXText = document.getElementById(
    "favicon_edit_bg_image_pos_x_text",
  );
  var fBgImagePosY = document.getElementById("favicon_edit_bg_image_pos_y");
  var fBgImagePosYText = document.getElementById(
    "favicon_edit_bg_image_pos_y_text",
  );
  var fBgImageOpacity = document.getElementById(
    "favicon_edit_bg_image_opacity",
  );
  var fBgImageOpacityText = document.getElementById(
    "favicon_edit_bg_image_opacity_text",
  );

  function setImageError(el, message) {
    if (!el) {
      return;
    }
    if (message) {
      el.hidden = false;
      el.textContent = message;
    } else {
      el.hidden = true;
      el.textContent = "";
    }
  }

  function setImageThumb(thumbEl, dataUrl) {
    if (!thumbEl) {
      return;
    }
    var dropzone = thumbEl.closest
      ? thumbEl.closest(".favicon_edit_image_dropzone")
      : thumbEl.parentNode;
    var wrap = dropzone && dropzone.parentNode;
    var options =
      wrap && wrap.parentNode
        ? wrap.parentNode.querySelector(".favicon_edit_image_options")
        : null;
    thumbEl.innerHTML = "";
    if (!dataUrl) {
      if (dropzone && dropzone.classList) {
        dropzone.classList.remove("favicon_edit_image_dropzone_filled");
      }
      if (options) {
        options.style.display = "none";
      }
      return;
    }
    var img = document.createElement("img");
    img.alt = "";
    img.src = dataUrl;
    thumbEl.appendChild(img);
    if (dropzone && dropzone.classList) {
      dropzone.classList.add("favicon_edit_image_dropzone_filled");
    }
    if (options) {
      options.style.display = "block";
    }
  }

  function persistImage(partial, errorEl) {
    var previous = {};
    Object.keys(partial).forEach(function (key) {
      previous[key] = currentSettings[key];
    });
    assignSettings(partial);
    if (partial.visualImage !== undefined) {
      setImageThumb(fVisualImageThumb, currentSettings.visualImage);
    }
    if (partial.bgImage !== undefined) {
      setImageThumb(fBgImageThumb, currentSettings.bgImage);
    }
    applyPreview();
    return FaviconStorage.set(partial).catch(function (err) {
      assignSettings(previous);
      if (partial.visualImage !== undefined) {
        setImageThumb(fVisualImageThumb, currentSettings.visualImage);
      }
      if (partial.bgImage !== undefined) {
        setImageThumb(fBgImageThumb, currentSettings.bgImage);
      }
      applyPreview();
      setImageError(
        errorEl,
        (err && err.message) || "Could not save that image.",
      );
    });
  }

  function saveImageFile(file, inputEl, errorEl, storageKey) {
    setImageError(errorEl, "");
    if (!file) {
      return;
    }
    FaviconImageUpload.fileToNormalizedDataUrl(file)
      .then(function (dataUrl) {
        var payload = {};
        payload[storageKey] = dataUrl;
        if (inputEl) {
          inputEl.value = "";
        }
        return persistImage(payload, errorEl);
      })
      .catch(function (err) {
        setImageError(
          errorEl,
          (err && err.message) || "Could not use that image.",
        );
        if (inputEl) {
          inputEl.value = "";
        }
      });
  }

  function bindImageUpload(inputEl, errorEl, storageKey) {
    inputEl.addEventListener("change", function () {
      var file = inputEl.files && inputEl.files[0];
      saveImageFile(file, inputEl, errorEl, storageKey);
    });

    var dropzone = inputEl.closest
      ? inputEl.closest(".favicon_edit_image_dropzone")
      : null;
    if (!dropzone) {
      return;
    }

    function setDrag(active) {
      dropzone.classList.toggle("favicon_edit_image_dropzone_drag", active);
    }

    dropzone.addEventListener("dragenter", function (event) {
      event.preventDefault();
      setDrag(true);
    });
    dropzone.addEventListener("dragover", function (event) {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "copy";
      }
      setDrag(true);
    });
    dropzone.addEventListener("dragleave", function (event) {
      if (dropzone.contains(event.relatedTarget)) {
        return;
      }
      setDrag(false);
    });
    dropzone.addEventListener("drop", function (event) {
      event.preventDefault();
      setDrag(false);
      var file = event.dataTransfer && event.dataTransfer.files[0];
      saveImageFile(file, inputEl, errorEl, storageKey);
    });
  }

  function bindImageRemove(buttonEl, inputEl, errorEl, storageKey) {
    buttonEl.addEventListener("click", function () {
      var payload = {};
      payload[storageKey] = "";
      setImageError(errorEl, "");
      if (inputEl) {
        inputEl.value = "";
      }
      persistImage(payload, errorEl);
    });
  }

  function bindImageRange(inputEl, textEl, storageKey, suffix) {
    inputEl.addEventListener("input", function () {
      var value = inputEl.value;
      textEl.innerHTML = "(" + value + suffix + ")";
      var payload = {};
      payload[storageKey] = value;
      persist(payload, { debounce: true });
    });
  }

  bindImageUpload(fVisualImageInput, fVisualImageError, "visualImage");
  bindImageRemove(
    fVisualImageRemove,
    fVisualImageInput,
    fVisualImageError,
    "visualImage",
  );
  bindImageRange(
    fVisualImageScale,
    fVisualImageScaleText,
    "visualImageScale",
    "%",
  );
  bindImageRange(
    fVisualImagePosX,
    fVisualImagePosXText,
    "visualImagePosX",
    "%",
  );
  bindImageRange(
    fVisualImagePosY,
    fVisualImagePosYText,
    "visualImagePosY",
    "%",
  );
  bindImageRange(
    fVisualImageOpacity,
    fVisualImageOpacityText,
    "visualImageOpacity",
    "%",
  );

  bindImageUpload(fBgImageInput, fBgImageError, "bgImage");
  bindImageRemove(fBgImageRemove, fBgImageInput, fBgImageError, "bgImage");
  bindImageRange(fBgImageScale, fBgImageScaleText, "bgImageScale", "%");
  bindImageRange(fBgImagePosX, fBgImagePosXText, "bgImagePosX", "%");
  bindImageRange(fBgImagePosY, fBgImagePosYText, "bgImagePosY", "%");
  bindImageRange(fBgImageOpacity, fBgImageOpacityText, "bgImageOpacity", "%");
  /* End image uploads + transforms */

  function syncFormFromSettings(settings) {
    fEditTextColor.value = settings.textColor;

    setTextStylePressed(fEditTextStyle1, settings.textStyle1);
    setTextStylePressed(fEditTextStyle2, settings.textStyle2);
    setTextStylePressed(fEditTextStyle3, settings.textStyle3);
    setTextStylePressed(fEditTextStyle4, settings.textStyle4);

    fEditSize.value = settings.fontSize;
    fEditSizeText.innerHTML = "(" + settings.fontSize + "px)";

    fEditGoogleFont.value = settings.fontFamily;
    fEditText.value = settings.text;

    if (settings.fontType == FontType.IMAGE) {
      setVisualTypeUi(FontType.IMAGE);
    } else if (settings.fontType == FontType.FONT_AWESOME) {
      setVisualTypeUi(FontType.FONT_AWESOME);
      setFontAwesomeButton(settings.fontAwesome);
    } else {
      setVisualTypeUi(FontType.TEXT);
    }

    setImageThumb(fVisualImageThumb, settings.visualImage);
    fVisualImageScale.value = settings.visualImageScale;
    fVisualImageScaleText.innerHTML = "(" + settings.visualImageScale + "%)";
    fVisualImagePosX.value = settings.visualImagePosX;
    fVisualImagePosXText.innerHTML = "(" + settings.visualImagePosX + "%)";
    fVisualImagePosY.value = settings.visualImagePosY;
    fVisualImagePosYText.innerHTML = "(" + settings.visualImagePosY + "%)";
    fVisualImageOpacity.value = settings.visualImageOpacity;
    fVisualImageOpacityText.innerHTML =
      "(" + settings.visualImageOpacity + "%)";

    fEditBgColor.value = settings.bgColor;
    fEditBgColor2.value = settings.bgColor2;
    fEditBgDegrees.value = settings.bgDegrees;
    fEditBgDegreesText.innerText = settings.bgDegrees;

    setBackgroundTypeUi(settings.bgType);

    setImageThumb(fBgImageThumb, settings.bgImage);
    fBgImageScale.value = settings.bgImageScale;
    fBgImageScaleText.innerHTML = "(" + settings.bgImageScale + "%)";
    fBgImagePosX.value = settings.bgImagePosX;
    fBgImagePosXText.innerHTML = "(" + settings.bgImagePosX + "%)";
    fBgImagePosY.value = settings.bgImagePosY;
    fBgImagePosYText.innerHTML = "(" + settings.bgImagePosY + "%)";
    fBgImageOpacity.value = settings.bgImageOpacity;
    fBgImageOpacityText.innerHTML = "(" + settings.bgImageOpacity + "%)";

    fEditBorderRadius.value = settings.borderRadius;
    fEditBorderRadiusText.innerHTML = "(" + settings.borderRadius + "%)";

    if (settings.border == Border.ENABLED) {
      setBorderUi(true);
      fEditBorderWidth.value = settings.borderWidth;
      fEditBorderWidthText.innerHTML = "(" + settings.borderWidth + "px)";
      fEditBorderColor.value = settings.borderColor;
    } else {
      setBorderUi(false);
    }
  }

  function loadEditor() {
    chrome.storage.local.get(
      FaviconDesign.KEYS.concat(["tab"]),
      function (result) {
        currentSettings = FaviconDesign.buildDesignSettings(result);
        syncFormFromSettings(currentSettings);

        if (result.tab != undefined) {
          var savedTab = parseInt(result.tab, 10);
          if (savedTab >= 1 && savedTab <= 3) {
            selectFaviconTab(savedTab, { persist: false });
          }
        }

        applyPreview();
      },
    );
  }

  loadEditor();
});
