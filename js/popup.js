document.addEventListener("DOMContentLoaded", function () {
  var FontType = FaviconSettings.FontType;
  var BgType = FaviconSettings.BgType;
  var BgGradientType = FaviconSettings.BgGradientType;
  var Border = FaviconSettings.Border;
  var RadialShape = FaviconSettings.RadialShape;
  var SettingsDefaults = FaviconSettings.Defaults;

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
      chrome.storage.local.set({ tab: String(tabIndex) });
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

  /* Favicon Type Nav */
  var fEditType1 = document.getElementById("favicon_edit_type1");
  var fEditType2 = document.getElementById("favicon_edit_type2");
  var fEditType1Container = document.getElementById("favicon_edit_type_text");
  var fEditType2Container = document.getElementById(
    "favicon_edit_type_fontawesome",
  );

  fEditType1.addEventListener("click", function () {
    fEditType1Container.style.display = "block";
    fEditType2Container.style.display = "none";
    chrome.storage.local.set({ fontType: FontType.TEXT });

    var textStyleItems = document.querySelectorAll(
      ".favicon_edit_text_style_item",
    );
    for (var i = 0; i < textStyleItems.length; i++) {
      textStyleItems[i].classList.remove(
        "favicon_edit_text_style_item_disabled",
      );
    }

    getFavicon();
  });

  fEditType2.addEventListener("click", function () {
    fEditType2Container.style.display = "block";
    fEditType1Container.style.display = "none";
    chrome.storage.local.set({ fontType: FontType.FONT_AWESOME });

    var textStyleItems = document.querySelectorAll(
      ".favicon_edit_text_style_item",
    );
    for (var i = 0; i < textStyleItems.length; i++) {
      textStyleItems[i].classList.add("favicon_edit_text_style_item_disabled");
    }

    getFavicon();
  });

  /* End of Favicon Type Nav */

  /* Favicon Background Nav */
  var fBackgroundType1 = document.getElementById(
    "favicon_edit_background_type_solid",
  );
  var fBackgroundType2 = document.getElementById(
    "favicon_edit_background_type_gradient",
  );
  var fBackgroundType2Container1 = document.getElementById(
    "favicon_edit_background_type_gradient_container",
  );
  var fBackgroundType2Container2 = document.getElementById(
    "favicon_edit_background_type_gradient_container2",
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
  var fEditBgGradientTypeValue = SettingsDefaults.bgGradientType;
  var fEditBgRadialShapeValue = SettingsDefaults.bgRadialShape;
  var fEditBgRadialPositionValue = SettingsDefaults.bgRadialPosition;

  function updateGradientTypeUi() {
    if (fEditBgGradientTypeValue == BgGradientType.RADIAL) {
      fGradientTypeRadial.checked = true;
      fEditBgDegreesContainer.style.display = "none";
      fEditRadialOptionsContainer.style.display = "block";
      if (fEditBgRadialShapeValue == RadialShape.ELLIPSE) {
        fRadialShapeEllipse.checked = true;
      } else {
        fRadialShapeCircle.checked = true;
      }
      fEditRadialPosition.value = fEditBgRadialPositionValue;
    } else {
      fGradientTypeLinear.checked = true;
      fEditBgDegreesContainer.style.display = "block";
      fEditRadialOptionsContainer.style.display = "none";
    }
  }

  function buildBgGradientCss(
    color1,
    color2,
    degrees,
    gradientType,
    radialShape,
    radialPosition,
  ) {
    if (gradientType == BgGradientType.RADIAL) {
      var shape =
        radialShape == RadialShape.ELLIPSE
          ? RadialShape.ELLIPSE
          : RadialShape.CIRCLE;
      var position = radialPosition || SettingsDefaults.bgRadialPosition;
      return (
        "radial-gradient(" +
        shape +
        " at " +
        position +
        ", " +
        color1 +
        " 0%, " +
        color2 +
        " 78%)"
      );
    }
    return (
      "linear-gradient(" +
      degrees +
      "deg, " +
      color1 +
      " 0%, " +
      color2 +
      " 78%)"
    );
  }

  fBackgroundType1.addEventListener("click", function () {
    fBackgroundType2Container1.style.display = "none";
    fBackgroundType2Container2.style.display = "none";
    chrome.storage.local.set({ bgType: BgType.SOLID });

    /*var textStyleItems = document.querySelectorAll(".favicon_edit_text_style_item");
        for(var i = 0; i < textStyleItems.length; i++){
            textStyleItems[i].classList.remove("favicon_edit_text_style_item_disabled");
        }*/

    getFavicon();
  });

  fBackgroundType2.addEventListener("click", function () {
    fBackgroundType2Container1.style.display = "block";
    fBackgroundType2Container2.style.display = "block";
    chrome.storage.local.set({ bgType: BgType.GRADIENT });
    updateGradientTypeUi();

    /*var textStyleItems = document.querySelectorAll(".favicon_edit_text_style_item");
        for(var i = 0; i < textStyleItems.length; i++){
            textStyleItems[i].classList.add("favicon_edit_text_style_item_disabled");
        }*/

    getFavicon();
  });

  fGradientTypeLinear.addEventListener("click", function () {
    fEditBgGradientTypeValue = BgGradientType.LINEAR;
    chrome.storage.local.set({ bgGradientType: BgGradientType.LINEAR });
    updateGradientTypeUi();
    getFavicon();
  });

  fGradientTypeRadial.addEventListener("click", function () {
    fEditBgGradientTypeValue = BgGradientType.RADIAL;
    chrome.storage.local.set({ bgGradientType: BgGradientType.RADIAL });
    updateGradientTypeUi();
    getFavicon();
  });

  fRadialShapeCircle.addEventListener("click", function () {
    fEditBgRadialShapeValue = RadialShape.CIRCLE;
    chrome.storage.local.set({ bgRadialShape: RadialShape.CIRCLE });
    getFavicon();
  });

  fRadialShapeEllipse.addEventListener("click", function () {
    fEditBgRadialShapeValue = RadialShape.ELLIPSE;
    chrome.storage.local.set({ bgRadialShape: RadialShape.ELLIPSE });
    getFavicon();
  });

  fEditRadialPosition.addEventListener("change", function () {
    fEditBgRadialPositionValue = fEditRadialPosition.value;
    chrome.storage.local.set({ bgRadialPosition: fEditBgRadialPositionValue });
    getFavicon();
  });

  /* End of Favicon Background Nav */

  /* Var value set */
  var fEditTextColorValue;
  var fEditBgColorValue;
  var fEditBgColorValue2;
  var fEditBgDegreesValue;
  var fEditSizeValue;
  var fEditBorderRadiusValue;
  var fEditBorderWidthValue;
  var fEditTextValue;
  var fEditGoogleFontValue;
  var fEditFontAwesomeValue;
  /* End of Var value set */

  /* Var input set */
  var fEditTextColor = document.getElementById("favicon_edit_text_color");
  var fEditBgColor = document.getElementById("favicon_edit_bg_color");
  var fEditBgColor2 = document.getElementById("favicon_edit_bg_color2");
  var fEditBgDegrees = document.getElementById("favicon_edit_linear_degs");
  var fEditBgDegreesText = document.getElementById(
    "favicon_edit_linear_degs_text",
  );
  var fEditSize = document.getElementById("favicon_edit_font_size");
  var fEditBorderRadius = document.getElementById("favicon_edit_border_radius");
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

  /* Text Color */
  fEditTextColor.addEventListener("input", fChangeTextColor);
  function fChangeTextColor() {
    fEditTextColorValue = document.getElementById(
      "favicon_edit_text_color",
    ).value;
    chrome.storage.local.set({ textColor: fEditTextColorValue });
    getFavicon();
  }
  /* End of Text Color */

  /* BG Color */
  fEditBgColor.addEventListener("input", fChangeBgColor);
  function fChangeBgColor() {
    fEditBgColorValue = document.getElementById("favicon_edit_bg_color").value;
    chrome.storage.local.set({ bgColor: fEditBgColorValue });
    getFavicon();
  }
  /* End of BG Color */

  /* BG Color2 */
  fEditBgColor2.addEventListener("input", fChangeBgColor2);
  function fChangeBgColor2() {
    fEditBgColorValue2 = document.getElementById(
      "favicon_edit_bg_color2",
    ).value;
    chrome.storage.local.set({ bgColor2: fEditBgColorValue2 });
    getFavicon();
  }

  /* Degrees */
  fEditBgDegrees.addEventListener("input", fChangeBgDegrees);
  function fChangeBgDegrees() {
    fEditBgDegreesValue = document.getElementById(
      "favicon_edit_linear_degs",
    ).value;
    fEditBgDegreesText.innerText = fEditBgDegreesValue;
    chrome.storage.local.set({ bgDegrees: fEditBgDegreesValue });
    getFavicon();
  }
  /* End Degrees */
  /* End of BG Color */

  /* Font Size */
  fEditSize.addEventListener("input", fChangeFontSize);
  function fChangeFontSize() {
    fEditSizeValue = document.getElementById("favicon_edit_font_size").value;
    chrome.storage.local.set({ fontSize: fEditSizeValue });
    getFavicon();
  }
  /* End of Font Size */

  /* Border Radius */
  fEditBorderRadius.addEventListener("input", fChangeBorderRadius);
  function fChangeBorderRadius() {
    fEditBorderRadiusValue = document.getElementById(
      "favicon_edit_border_radius",
    ).value;
    chrome.storage.local.set({ borderRadius: fEditBorderRadiusValue });
    getFavicon();
  }
  /* End of Border Radius */

  /* Text */
  fEditText.addEventListener("change", fChangeText);
  fEditText.addEventListener("keyup", fChangeText);
  function fChangeText() {
    fEditTextValue = document.getElementById("favicon_edit_text").value;
    chrome.storage.local.set({ text: fEditTextValue });
    getFavicon();
  }
  /* End of Text */

  /* Text Style: Bold */
  fEditTextStyle1.addEventListener("click", function () {
    fEditTextStyle1.classList.toggle("favicon_edit_text_style_item_selected");
    if (
      fEditTextStyle1.classList.contains(
        "favicon_edit_text_style_item_selected",
      )
    ) {
      chrome.storage.local.set({ textStyle1: true });
    } else {
      chrome.storage.local.set({ textStyle1: false });
    }
    getFavicon();
  });
  /* End Text Style: Bold */

  /* Text Style: Italic */
  fEditTextStyle2.addEventListener("click", function () {
    fEditTextStyle2.classList.toggle("favicon_edit_text_style_item_selected");
    if (
      fEditTextStyle2.classList.contains(
        "favicon_edit_text_style_item_selected",
      )
    ) {
      chrome.storage.local.set({ textStyle2: true });
    } else {
      chrome.storage.local.set({ textStyle2: false });
    }
    getFavicon();
  });
  /* End Text Style: Italic */

  /* Text Style: Underline */
  fEditTextStyle3.addEventListener("click", function () {
    fEditTextStyle3.classList.toggle("favicon_edit_text_style_item_selected");
    if (
      fEditTextStyle3.classList.contains(
        "favicon_edit_text_style_item_selected",
      )
    ) {
      chrome.storage.local.set({ textStyle3: true });
      chrome.storage.local.set({ textStyle4: false });
      fEditTextStyle4.classList.remove("favicon_edit_text_style_item_selected");
    } else {
      chrome.storage.local.set({ textStyle3: false });
    }
    getFavicon();
  });
  /* End Text Style: Underline */

  /* Text Style: Strike */
  fEditTextStyle4.addEventListener("click", function () {
    fEditTextStyle4.classList.toggle("favicon_edit_text_style_item_selected");
    if (
      fEditTextStyle4.classList.contains(
        "favicon_edit_text_style_item_selected",
      )
    ) {
      chrome.storage.local.set({ textStyle4: true });
      chrome.storage.local.set({ textStyle3: false });
      fEditTextStyle3.classList.remove("favicon_edit_text_style_item_selected");
    } else {
      chrome.storage.local.set({ textStyle4: false });
    }
    getFavicon();
  });
  /* End Text Style: Strike */

  /* Google Fonts */
  fEditGoogleFont.addEventListener("change", fChangeGoogleFont);
  function fChangeGoogleFont() {
    fEditGoogleFontValue = document.getElementById(
      "favicon_edit_google_font",
    ).value;
    chrome.storage.local.set({ fontFamily: fEditGoogleFontValue });
    getFavicon();
  }

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

  for (var i = 0; i < FONT_AWESOME_ICONS.length; i++) {
    var icon = FONT_AWESOME_ICONS[i];
    var li = document.createElement("li");
    li.setAttribute("data-icon", icon);
    li.innerHTML =
      '<i class="fa ' +
      icon +
      '"></i> <span>' +
      formatFontAwesomeLabel(icon) +
      "</span>";
    fontAwesomeContainer.appendChild(li);
  }

  fontAwesomeButton.addEventListener("click", function () {
    fontAwesomeContainer.classList.toggle("favicon_edit_font_awesome_active");
  });

  fontAwesomeContainer.addEventListener("click", function (e) {
    var fontAwesomeChange = false;
    var item = e.target.closest("li");
    if (item && fontAwesomeContainer.contains(item)) {
      fEditFontAwesomeValue = item.getAttribute("data-icon");
      selectFontAwesomeIcon(fEditFontAwesomeValue);
    }
  });

  function selectFontAwesomeIcon(el) {
    chrome.storage.local.set({ fontAwesome: el });
    setTimeout(function () {
      fontAwesomeContainer.classList.remove("favicon_edit_font_awesome_active");
    }, 150);
    fontAwesomeButton.innerHTML =
      "<i class='fa " +
      el +
      "'></i>" +
      formatFontAwesomeLabel(el) +
      " <i class='fa fa-caret-down'></i>";
    getFavicon();
  }

  document.addEventListener("click", function (event) {
    var isClickInsideContainer = fontAwesomeContainer.contains(event.target);
    var isClickInsideButton = fontAwesomeButton.contains(event.target);
    if (isClickInsideContainer || isClickInsideButton) {
      fontAwesomeContainer.classList.add("favicon_edit_font_awesome_active");
    } else {
      fontAwesomeContainer.classList.remove("favicon_edit_font_awesome_active");
    }
  });

  fEditBorderEnabled.addEventListener("click", fChangeBorder1);
  function fChangeBorder1() {
    fEditBorderEnabled.classList.add("favicon_edit_border_item_active");
    fEditBorderDisabled.classList.remove("favicon_edit_border_item_active");
    chrome.storage.local.set({ border: Border.ENABLED });
    fEditBorderContainer.style.display = "block";
    getFavicon();
  }

  fEditBorderDisabled.addEventListener("click", fChangeBorder2);
  function fChangeBorder2() {
    fEditBorderEnabled.classList.remove("favicon_edit_border_item_active");
    fEditBorderDisabled.classList.add("favicon_edit_border_item_active");
    chrome.storage.local.set({ border: Border.DISABLED });
    fEditBorderContainer.style.display = "none";
    getFavicon();
  }

  fEditBorderColor.addEventListener("change", fChangeBorderColor);
  function fChangeBorderColor() {
    chrome.storage.local.set({
      borderColor: document.getElementById("favicon_edit_border_color").value,
    });
    getFavicon();
  }

  fEditBorderWidth.addEventListener("input", fChangeBorderWidth);
  function fChangeBorderWidth() {
    fEditBorderWidthValue = document.getElementById(
      "favicon_edit_border_width",
    ).value;
    chrome.storage.local.set({ borderWidth: fEditBorderWidthValue });
    getFavicon();
  }

  function getFavicon() {
    // Have to declare this here as well? Not sure why?
    //Is it because its declared and not visible if FontAwesome is displayed first
    fEditText = document.getElementById("favicon_edit_text");

    if (!faviconCreated) {
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

    chrome.storage.local.get(
      [
        "fontType",
        "textColor",
        "bgColor",
        "bgColor2",
        "bgType",
        "bgGradientType",
        "bgRadialShape",
        "bgRadialPosition",
        "bgDegrees",
        "fontSize",
        "borderRadius",
        "text",
        "textStyle1",
        "textStyle2",
        "textStyle3",
        "textStyle4",
        "fontFamily",
        "fontAwesome",
        "tab",
        "border",
        "borderColor",
        "borderWidth",
      ],
      function (result) {
        // Tab
        if (result.tab != undefined) {
          var savedTab = parseInt(result.tab, 10);
          if (savedTab >= 1 && savedTab <= 3) {
            selectFaviconTab(savedTab, { persist: false });
          }
        }

        // Text Color
        if (result.textColor != undefined) {
          //console.log("Text Color: " + result.textColor);
          fEditTextColorValue = result.textColor;
        } else {
          //console.log("Text Color NOT SET");
          fEditTextColorValue = "#FFFFFF";
        }
        fEditTextColor.value = fEditTextColorValue;
        fDisplay2.style.color = fEditTextColorValue;

        // Text Style: Bold
        if (result.textStyle1 != undefined) {
          //console.log("Bold: " + result.textStyle1);
          if (result.textStyle1 == true) {
            fDisplay2.style.fontWeight = "bold";
            fEditTextStyle1.classList.add(
              "favicon_edit_text_style_item_selected",
            );
          } else {
            fDisplay2.style.fontWeight = "normal";
          }
        } else {
          //console.log("Bold Not set");
          fDisplay2.style.fontWeight = "normal";
        }

        // Text Style: Italic
        if (result.textStyle2 != undefined) {
          //console.log("Italic: " + result.textStyle2);
          if (result.textStyle2 == true) {
            fDisplay2.style.fontStyle = "italic";
            fEditTextStyle2.classList.add(
              "favicon_edit_text_style_item_selected",
            );
          } else {
            fDisplay2.style.fontStyle = "normal";
          }
        } else {
          //console.log("Italic Not set");
          fDisplay2.style.fontStyle = "normal";
        }

        // Text Style: Underline
        if (result.textStyle3 != undefined) {
          //console.log("Underline: " + result.textStyle3);
          if (result.textStyle3 == true) {
            fDisplay2.style.textDecoration = "underline";
            fEditTextStyle3.classList.add(
              "favicon_edit_text_style_item_selected",
            );
          } else {
            fDisplay2.style.textDecoration = "inherit";
          }
        } else {
          //console.log("Underline Not set");
          fDisplay2.style.textDecoration = "inherit";
        }

        // Text Style: Strike
        if (result.textStyle3 != undefined && result.textStyle3 != true) {
          if (result.textStyle4 != undefined) {
            //console.log("Strike: " + result.textStyle4);
            if (result.textStyle4 == true) {
              fDisplay2.style.textDecoration = "line-through";
              fEditTextStyle4.classList.add(
                "favicon_edit_text_style_item_selected",
              );
            } else {
              fDisplay2.style.textDecoration = "inherit";
            }
          } else {
            //console.log("Strike Not set");
            fDisplay2.style.textDecoration = "inherit";
          }
        } else {
          fEditTextStyle4.classList.remove(
            "favicon_edit_text_style_item_selected",
          );
        }

        // Font Size
        if (result.fontSize != undefined) {
          //console.log("Font Size: " + result.fontSize);
          fEditSizeValue = result.fontSize;
        } else {
          //console.log("Font Size NOT SET");
          fEditSizeValue = "30";
        }
        fEditSize.value = fEditSizeValue;
        fDisplay2.style.fontSize = fEditSizeValue + "px";
        document.getElementById("favicon_edit_font_size_text").innerHTML =
          "(" + fEditSizeValue + "px)";

        // Font Type
        if (result.fontType != undefined) {
          if (result.fontType == FontType.FONT_AWESOME) {
            //console.log("Font Awesome is Checked");
            var textStyleItems = document.querySelectorAll(
              ".favicon_edit_text_style_item",
            );
            for (var i = 0; i < textStyleItems.length; i++) {
              textStyleItems[i].classList.add(
                "favicon_edit_text_style_item_disabled",
              );
            }
            addIcon();
          } else {
            addText();
          }
        } else {
          addText();
        }

        function addText() {
          // Text
          if (result.text != undefined) {
            //console.log("Text: " + result.text);
            fEditTextValue = result.text;
          } else {
            //console.log("Text NOT SET");
            fEditTextValue = "F";
          }
          fEditText.value = fEditTextValue;
          fDisplay2.innerHTML = fEditTextValue;
        }

        function addIcon() {
          // Font Awesome
          fEditType1Container.style.display = "none";
          fEditType2Container.style.display = "block";
          fEditType2.checked = true;

          if (result.fontAwesome != undefined) {
            //console.log("Font Awesome: " + result.fontAwesome);
            fEditText = '<i class="fa ' + result.fontAwesome + '"></i>';
            fEditText2 = formatFontAwesomeLabel(result.fontAwesome);
          } else {
            //console.log("Font Awesome NOT SET");
            fEditText = '<i class="fa fa-thumbs-up"></i>';
            fEditText2 = formatFontAwesomeLabel("fa-thumbs-up");
          }
          fontAwesomeButton.innerHTML =
            fEditText + fEditText2 + " <i class='fa fa-caret-down'></i>";
          fDisplay2.innerHTML = fEditText;
        }

        // Font Family
        if (result.fontFamily != undefined) {
          //console.log("Font Family: " + result.fontFamily);
          fEditGoogleFontValue = result.fontFamily;
        } else {
          //console.log("Font Family NOT SET");
          fEditGoogleFontValue = "Montserrat";
        }
        fEditGoogleFont.value = fEditGoogleFontValue;
        fDisplay2.style.fontFamily = fEditGoogleFontValue;
        document
          .getElementById("googleFontStylesheet")
          .setAttribute(
            "href",
            "https://fonts.googleapis.com/css?family=" + fEditGoogleFontValue,
          );

        if (result.bgType != undefined) {
          if (result.bgType == BgType.GRADIENT) {
            //console.log("Gradient Checked is Checked");
            addGradient();
          } else {
            addBackgroundColor();
          }
        } else {
          addBackgroundColor();
        }

        function addBackgroundColor() {
          // Background Color
          if (result.bgColor != undefined) {
            //console.log("BG Color: " + result.bgColor);
            fEditBgColorValue = result.bgColor;
          } else {
            //console.log("BG Color NOT SET");
            fEditBgColorValue = "#FE145B";
          }
          fEditBgColor.value = fEditBgColorValue;
          fDisplay1.style.background = "";
          fDisplay1.style.backgroundColor = fEditBgColorValue;
        }

        function addGradient() {
          fBackgroundType2Container1.style.display = "block";
          fBackgroundType2Container2.style.display = "block";
          fBackgroundType2.checked = true;

          // Add a normal bg first
          if (result.bgColor != undefined) {
            //console.log("BG Color: " + result.bgColor);
            fEditBgColorValue = result.bgColor;
          } else {
            //console.log("BG Color NOT SET");
            fEditBgColorValue = "#FE145B";
          }
          fEditBgColor.value = fEditBgColorValue;
          fDisplay1.style.backgroundColor = fEditBgColorValue;

          if (result.bgColor2 != undefined) {
            fEditBgColorValue2 = result.bgColor2;
          } else {
            fEditBgColorValue2 = "#000000";
          }

          if (result.bgDegrees != undefined) {
            fEditBgDegreesValue = result.bgDegrees;
          } else {
            fEditBgDegreesValue = 90;
          }

          if (result.bgGradientType != undefined) {
            fEditBgGradientTypeValue = result.bgGradientType;
          } else {
            fEditBgGradientTypeValue = SettingsDefaults.bgGradientType;
          }

          if (result.bgRadialShape != undefined) {
            fEditBgRadialShapeValue = result.bgRadialShape;
          } else {
            fEditBgRadialShapeValue = SettingsDefaults.bgRadialShape;
          }

          if (result.bgRadialPosition != undefined) {
            fEditBgRadialPositionValue = result.bgRadialPosition;
          } else {
            fEditBgRadialPositionValue = SettingsDefaults.bgRadialPosition;
          }
          updateGradientTypeUi();

          var theGradient = buildBgGradientCss(
            fEditBgColorValue,
            fEditBgColorValue2,
            fEditBgDegreesValue,
            fEditBgGradientTypeValue,
            fEditBgRadialShapeValue,
            fEditBgRadialPositionValue,
          );
          fEditBgDegrees.value = fEditBgDegreesValue;
          fEditBgDegreesText.innerText = fEditBgDegreesValue;
          fEditBgColor2.value = fEditBgColorValue2;
          fDisplay1.style.background = theGradient;
        }

        // Border Radius
        if (result.borderRadius != undefined) {
          //console.log("Border Radius: " + result.borderRadius);
          fEditBorderRadiusValue = result.borderRadius;
        } else {
          //console.log("Border Radius NOT SET");
          fEditBorderRadiusValue = "0";
        }
        fEditBorderRadius.value = fEditBorderRadiusValue;
        fDisplay1.style.borderRadius = fEditBorderRadiusValue + "%";
        document.getElementById("favicon_edit_border_radius_text").innerHTML =
          "(" + fEditBorderRadiusValue + "%)";

        // Border Display
        if (result.border != undefined) {
          if (result.border == Border.ENABLED) {
            fEditBorderEnabled.classList.add("favicon_edit_border_item_active");
            fEditBorderDisabled.classList.remove(
              "favicon_edit_border_item_active",
            );
            fEditBorderContainer.style.display = "block";
            borderCreator();
          } else {
            fDisplay1.style.border = "";
          }
        } else {
          fDisplay1.style.border = "";
        }

        // Border Creator
        function borderCreator() {
          if (result.borderWidth != undefined) {
            borderWidth = result.borderWidth + "px";
            fEditBorderWidth.value = result.borderWidth;
            fEditBorderWidthText.innerHTML = "(" + result.borderWidth + "px)";
          } else {
            borderWidth = "1px";
          }

          borderStyle = "solid";

          if (result.borderColor != undefined) {
            borderColor = result.borderColor;
            fEditBorderColor.value = result.borderColor;
          } else {
            borderColor = "#000000";
          }

          fDisplay1.style.border =
            borderWidth + " " + borderStyle + " " + borderColor;
        }

        if (
          typeof previewFaviconInActiveTab === "function" &&
          typeof FaviconCanvas !== "undefined"
        ) {
          previewFaviconInActiveTab(FaviconCanvas.normalizeSettings(result));
        }
      },
    );
  }

  getFavicon();
});
