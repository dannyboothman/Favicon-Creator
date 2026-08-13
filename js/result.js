
document.addEventListener('DOMContentLoaded', function() {
    var FontType = FaviconSettings.FontType;
    var BgType = FaviconSettings.BgType;
    var BgGradientType = FaviconSettings.BgGradientType;
    var Border = FaviconSettings.Border;
    var RadialShape = FaviconSettings.RadialShape;
    var FileType = FaviconSettings.FileType;
    var FileOption = FaviconSettings.FileOption;
    var SettingsDefaults = FaviconSettings.Defaults;

    /* Var value set */
    var fEditTextColorValue;
    var fEditBgColorValue;
    var fEditBgColorValue2;
    var fEditSizeValue;
    var fEditBorderRadiusValue;
    var fEditTextValue;
    var fEditGoogleFontValue;
    var fEditDownloadButton = document.getElementById("favicon_download_button");
    var fEditDownloadFeedback = document.getElementById("favicon_download_feedback");
    var fEditFileType1 = document.getElementById("download_type1");
    var fEditFileType2 = document.getElementById("download_type2");
    var fEditFileHtml = document.getElementById("download_html");
    var fEditFileReadMe = document.getElementById("download_readme");
    var HISTORY_MAX = 30;
    var HISTORY_KEY = "faviconHistory";
    /* End of Var value set */

    function buildDesignSettings(result){
        return {
            fontType: result.fontType != undefined ? result.fontType : SettingsDefaults.fontType,
            text: result.text != undefined ? result.text : "F",
            fontAwesome: result.fontAwesome != undefined ? result.fontAwesome : "fa-thumbs-up",
            fontFamily: result.fontFamily != undefined ? result.fontFamily : "Montserrat",
            fontSize: result.fontSize != undefined ? result.fontSize : "30",
            textColor: result.textColor != undefined ? result.textColor : "#FFFFFF",
            textStyle1: result.textStyle1 === true,
            textStyle2: result.textStyle2 === true,
            textStyle3: result.textStyle3 === true,
            textStyle4: result.textStyle4 === true,
            bgType: result.bgType != undefined ? result.bgType : SettingsDefaults.bgType,
            bgGradientType: result.bgGradientType != undefined ? result.bgGradientType : SettingsDefaults.bgGradientType,
            bgRadialShape: result.bgRadialShape != undefined ? result.bgRadialShape : SettingsDefaults.bgRadialShape,
            bgRadialPosition: result.bgRadialPosition != undefined ? result.bgRadialPosition : SettingsDefaults.bgRadialPosition,
            bgColor: result.bgColor != undefined ? result.bgColor : "#FE145B",
            bgColor2: result.bgColor2 != undefined ? result.bgColor2 : "#000000",
            bgDegrees: result.bgDegrees != undefined ? result.bgDegrees : 90,
            borderRadius: result.borderRadius != undefined ? result.borderRadius : "0",
            border: result.border != undefined ? result.border : SettingsDefaults.border,
            borderColor: result.borderColor != undefined ? result.borderColor : "#000000",
            borderWidth: result.borderWidth != undefined ? result.borderWidth : SettingsDefaults.borderWidth
        };
    }

    function settingsEqual(a, b){
        if (!a || !b){
            return false;
        }
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function saveFaviconToHistory(result){
        var settings = buildDesignSettings(result);
        chrome.storage.local.get([HISTORY_KEY], function(stored){
            var history = Array.isArray(stored[HISTORY_KEY]) ? stored[HISTORY_KEY].slice() : [];
            if (history.length > 0 && settingsEqual(history[0].settings, settings)){
                return;
            }
            history.unshift({
                id: Date.now() + "-" + Math.floor(Math.random() * 100000),
                createdAt: Date.now(),
                settings: settings
            });
            history = history.slice(0, HISTORY_MAX).map(function(entry){
                return {
                    id: entry.id,
                    createdAt: entry.createdAt,
                    settings: entry.settings
                };
            });
            var payload = {};
            payload[HISTORY_KEY] = history;
            chrome.storage.local.set(payload);
        });
    }

    // Set Local storage for checkboxes
    fEditFileType1.addEventListener("change", fChangeFileType1);    
    function fChangeFileType1(){
        chrome.storage.local.set({fileType: FileType.PNG});
        htmlOutput();
    }
    fEditFileType2.addEventListener("change", fChangeFileType2);    
    function fChangeFileType2(){
        chrome.storage.local.set({fileType: FileType.JPG});
        htmlOutput();
    }
    fEditFileHtml.addEventListener("change", fChangeFileHtml);
    function fChangeFileHtml(){
        if (fEditFileHtml.checked){
            chrome.storage.local.set({fileHtml: FileOption.ENABLED});
            htmlOutput();
        } else {
            chrome.storage.local.set({fileHtml: FileOption.DISABLED});
            document.getElementById("html_output_container").style.display = "none";
        }
    }
    fEditFileReadMe.addEventListener("change", fChangeFileReadMe);
    function fChangeFileReadMe(){
        if (fEditFileReadMe.checked){
            chrome.storage.local.set({fileReadMe: FileOption.ENABLED});
        } else {
            chrome.storage.local.set({fileReadMe: FileOption.DISABLED});
        }
    }

    var isDownloading = false;

    function setDownloadButtonEnabled(enabled) {
        fEditDownloadButton.disabled = !enabled;
        fEditDownloadButton.classList.toggle("favicon_download_button_disabled", !enabled);
    }

    fEditDownloadButton.addEventListener('click', function() {
        if (isDownloading || fEditDownloadButton.disabled){
            return;
        }
        if (firstLoad === false){
            isDownloading = true;
            fEditDownloadButton.textContent = "Downloading";
            setDownloadButtonEnabled(false);
        }
        getFavicon();
    });

    function finishDownloading(){
        isDownloading = false;
        fEditDownloadButton.textContent = "Download";
        if (document.querySelector("input[name='download_size']:checked")){
            setDownloadButtonEnabled(true);
        }
    }

    // HTML OUTPUT
    function htmlOutput(){

        var sizeCheckboxes = document.querySelectorAll("input[name='download_size']");
        sizeCheckboxes.forEach(function (element)
        {
            var htmlOutputCodeCount = 0;
            var htmlOutputCode = "";
            var htmlOutputCodeType = 'png';
            if (fEditFileType2.checked){
                //console.log("jpg is checked")
                htmlOutputCodeType = 'jpg';
            }

            for (var i = 0; i < sizeCheckboxes.length; i++){
                var sizeCheckboxId = sizeCheckboxes[i].getAttribute("id");
                if (sizeCheckboxes[i].checked){
                    switch(sizeCheckboxId){
                        case "download_size1":
                            htmlOutputCodeCount++;
                            htmlOutputCode += '&lt;link rel=&quot;icon&quot; sizes=&quot;16x16&quot; type=&quot;image/'+htmlOutputCodeType+'&quot; href=&quot;images/favicon16x16.'+htmlOutputCodeType+'&quot;&gt;<br /><br />';
                            break;
                        case "download_size2":
                            htmlOutputCodeCount++;
                            htmlOutputCode += '&lt;link rel=&quot;icon&quot; sizes=&quot;32x32&quot; type=&quot;image/'+htmlOutputCodeType+'&quot; href=&quot;images/favicon32x32.'+htmlOutputCodeType+'&quot;&gt;<br /><br />';
                            break;
                        case "download_size3":
                            htmlOutputCodeCount++;
                            htmlOutputCode += '&lt;link rel=&quot;icon&quot; sizes=&quot;64x64&quot; type=&quot;image/'+htmlOutputCodeType+'&quot; href=&quot;images/favicon64x64.'+htmlOutputCodeType+'&quot;&gt;<br /><br />';
                            break;
                        case "download_size4":
                            htmlOutputCodeCount++;
                            htmlOutputCode += '&lt;link rel=&quot;icon&quot; sizes=&quot;128x128&quot; type=&quot;image/'+htmlOutputCodeType+'&quot; href=&quot;images/favicon128x128.'+htmlOutputCodeType+'&quot;&gt;<br /><br />';
                            break;
                        case "download_size5":
                            htmlOutputCodeCount++;
                            htmlOutputCode += '&lt;link rel=&quot;icon&quot; sizes=&quot;256x256&quot; type=&quot;image/'+htmlOutputCodeType+'&quot; href=&quot;images/favicon256x256.'+htmlOutputCodeType+'&quot;&gt;';
                            break;
                    }
                }
            }
            if (htmlOutputCode.length > 0 && fEditFileHtml.checked){
                document.getElementById("html_output_container").style.display = "block";
                document.getElementById("html_output").innerHTML = htmlOutputCode;
            } else {
                document.getElementById("html_output_container").style.display = "none";
            }

            if (htmlOutputCodeCount <= 2){
                document.getElementById("html_output_pre").classList.add("pre_hide_scroll");
            } else {
                document.getElementById("html_output_pre").classList.remove("pre_hide_scroll");
            }

        });

    }

    var firstLoad = true;
    getFavicon();

    function getFavicon(){

        var shouldDownload = firstLoad === false;
        var faviconHtml = '';
            faviconHtml += '<div id="favicon_display">';
                faviconHtml += '<div id="favicon_display_content"></div>';
            faviconHtml += '</div>';

        var faviconHtmlContainer = document.getElementById("favicon_display_container");

        // Keep the styled preview on download so it does not flash/disappear
        if (!shouldDownload || !document.getElementById("favicon_display")){
            faviconHtmlContainer.innerHTML = faviconHtml;
        }

        fDisplay1 = document.getElementById("favicon_display");
        fDisplay2 = document.getElementById("favicon_display_content");

        var borderLive = false;

        chrome.storage.local.get(['fontType', 'textColor', 'bgColor', 'bgColor2', 'bgType', 'bgGradientType', 'bgRadialShape', 'bgRadialPosition', 'bgDegrees', 'fontSize', 'borderRadius', 'text', 'textStyle1', 'textStyle2', 'textStyle3', 'textStyle4', 'fontFamily', 'fontAwesome', 'border', 'borderColor', 'borderWidth', 'download_size1', 'download_size2', 'download_size3', 'download_size4', 'download_size5', 'fileType', 'fileHtml', 'fileReadMe'], function(result) {

            var totalSizeChecked = 0;

            // 16 x 16
            if (result.download_size1 != undefined){
                //console.log("download_size1: " + result.download_size1);
                if (result.download_size1 == true){
                    document.getElementById("download_size1").checked = true;
                    totalSizeChecked++;
                } else {
                    document.getElementById("download_size1").checked = false;
                }
            } else {
                //console.log("16 x 16 is not set");
                document.getElementById("download_size1").checked = true;
                totalSizeChecked++;
            }

            // 32 x 32
            if (result.download_size2 != undefined){
                //console.log("download_size2: " + result.download_size2);
                if (result.download_size2 == true){
                    document.getElementById("download_size2").checked = true;
                    totalSizeChecked++;
                } else {
                    document.getElementById("download_size2").checked = false;
                }
            } else {
                //console.log("32 x 32 is not set");
                document.getElementById("download_size2").checked = true;
                totalSizeChecked++;
            }

            // 64 x 64
            if (result.download_size3 != undefined){
                //console.log("download_size3: " + result.download_size3);
                if (result.download_size3 == true){
                    document.getElementById("download_size3").checked = true;
                    totalSizeChecked++;
                } else {
                    document.getElementById("download_size3").checked = false;
                }
            } else {
                //console.log("64 x 64 is not set");
                document.getElementById("download_size3").checked = true;
                totalSizeChecked++;
            }

            // 128 x 128
            if (result.download_size4 != undefined){
                //console.log("download_size4: " + result.download_size4);
                if (result.download_size4 == true){
                    document.getElementById("download_size4").checked = true;
                    totalSizeChecked++;
                } else {
                    document.getElementById("download_size4").checked = false;
                }
            } else {
                //console.log("128 x 128 is not set");
                document.getElementById("download_size4").checked = false;
            }

            if (result.download_size5 != undefined){
                //console.log("download_size5: " + result.download_size5);
                if (result.download_size5 == true){
                    document.getElementById("download_size5").checked = true;
                    totalSizeChecked++;
                } else {
                    document.getElementById("download_size5").checked = false;
                }
            } else {
                //console.log("256 x 256 is not set");
                document.getElementById("download_size5").checked = false;
            }

            if (totalSizeChecked > 0){
                if (!isDownloading){
                    setDownloadButtonEnabled(true);
                }
                fEditDownloadFeedback.innerText = "";
            } else {
                setDownloadButtonEnabled(false);
                fEditDownloadFeedback.innerText = "You need at least one image size selected in order to download your Favicon";
            }

            // File HTML
            if (result.fileHtml != undefined){
                if (result.fileHtml == FileOption.ENABLED){
                    fEditFileHtml.checked = true;
                    document.getElementById("html_output_container").style.display = "block";
                } else {
                    fEditFileHtml.checked = false;
                    document.getElementById("html_output_container").style.display = "none";
                }
            } else {
                //console.log("File HTML is not set");
                fEditFileHtml.checked = true;
                document.getElementById("html_output_container").style.display = "block";
            }

            // File ReadMe
            if (result.fileReadMe != undefined){
                //console.log("File Read Me: " + result.fileReadMe);
                if (result.fileReadMe == FileOption.ENABLED){
                    fEditFileReadMe.checked = true;
                } else {
                    fEditFileReadMe.checked = false;
                }
            } else {
                //console.log("File Read Me is not set");
                fEditFileReadMe.checked = true;
            }

            // File Type
            if (result.fileType != undefined){
                //console.log("File Type: " + result.fileType);
                if (result.fileType == FileType.PNG){
                    fEditFileType1.checked = true;     
                } else {
                    fEditFileType2.checked = true;
                }
            } else {
                //console.log("File Type is not set");
                fEditFileType1.checked = true;
            }

            // Text Color
            if (result.textColor != undefined){
                //console.log("Text Color: " + result.textColor);
                fEditTextColorValue = result.textColor;
            } else {
                //console.log("Text Color NOT SET");
                fEditTextColorValue = "#FFFFFF";
            }
            fDisplay2.style.color = fEditTextColorValue;

            // Text Style: Bold
            if (result.textStyle1 != undefined){
                if (result.textStyle1 == true){
                    fDisplay2.style.fontWeight = "bold";
                } else {
                    fDisplay2.style.fontWeight = "normal";
                }
            } else {
                fDisplay2.style.fontWeight = "normal";
            }

            // Text Style: Italic
            if (result.textStyle2 != undefined){
                if (result.textStyle2 == true){
                    fDisplay2.style.fontStyle = "italic";
                } else {
                    fDisplay2.style.fontStyle = "normal";
                }
            } else {
                fDisplay2.style.fontStyle = "normal";
            }

            // Text Style: Underline
            if (result.textStyle3 != undefined){
                if (result.textStyle3 == true){
                    fDisplay2.style.textDecoration = "underline";
                } else {
                    fDisplay2.style.textDecoration = "inherit";
                }
            } else {
                fDisplay2.style.textDecoration = "inherit";
            }

            // Text Style: Strike
            if (result.textStyle3 != undefined && result.textStyle3 != true){
                if (result.textStyle4 != undefined){
                    if (result.textStyle4 == true){
                        fDisplay2.style.textDecoration = "line-through";
                    } else {
                        fDisplay2.style.textDecoration = "inherit";
                    }
                } else {
                    fDisplay2.style.textDecoration = "inherit";
                }
            }


            // Background Color
            if (result.bgColor != undefined){
                //console.log("BG Color: " + result.bgColor);
                fEditBgColorValue = result.bgColor;
            } else {
                //console.log("BG Color NOT SET");
                fEditBgColorValue = "#FE145B";
            }
            fDisplay1.style.backgroundColor = fEditBgColorValue;

            // Background Gradient
            if (result.bgType != undefined && result.bgType == BgType.GRADIENT){
                fEditBgColorValue = result.bgColor ? result.bgColor : "#FE145B";
                fEditBgColorValue2 = result.bgColor2 ? result.bgColor2 : "#000";
                var fEditBgDegreesValue = result.bgDegrees != undefined ? result.bgDegrees : 90;
                var fEditBgGradientTypeValue = result.bgGradientType != undefined ? result.bgGradientType : SettingsDefaults.bgGradientType;
                if (fEditBgGradientTypeValue == BgGradientType.RADIAL){
                    var radialShape = result.bgRadialShape == RadialShape.ELLIPSE ? RadialShape.ELLIPSE : RadialShape.CIRCLE;
                    var radialPosition = result.bgRadialPosition || SettingsDefaults.bgRadialPosition;
                    fDisplay1.style.background = `radial-gradient(${radialShape} at ${radialPosition}, ${fEditBgColorValue} 0%, ${fEditBgColorValue2} 78%)`;
                } else {
                    fDisplay1.style.background = `linear-gradient(${fEditBgDegreesValue}deg, ${fEditBgColorValue} 0%, ${fEditBgColorValue2} 78%)`;
                }
            }

            // Border Radius
            if (result.borderRadius != undefined){
                //console.log("Border Radius: " + result.fontSize);
                fEditBorderRadiusValue = result.borderRadius;
            } else {
                //console.log("Border Radius NOT SET");
                fEditBorderRadiusValue = "0";
            }
            fDisplay1.style.borderRadius = fEditBorderRadiusValue + "%";
            
            // Font Size
            if (result.fontSize != undefined){
                //console.log("Font Size: " + result.fontSize);
                fEditSizeValue = result.fontSize;
            } else {
                //console.log("Font Size NOT SET");
                fEditSizeValue = "30";
            }
            fDisplay2.style.fontSize = fEditSizeValue + "px";

            

            // Border
            // Border Display
            if (result.border != undefined){
                if (result.border == Border.ENABLED){
                    borderLive = true;
                    borderCreator();
                }
            }


            // Border Creator
            function borderCreator(){

                if (result.borderWidth != undefined){
                    borderWidth = result.borderWidth;
                } else {
                    borderWidth = 1;
                }

                if (result.borderColor != undefined){
                    borderColor = result.borderColor;
                } else {
                    borderColor = "#000000";
                }

                borderStyle = "solid";
                
                fDisplay1.style.border = borderWidth + "px " + borderStyle + " " + borderColor;

            }




            // Font Type
            if (result.fontType != undefined){
                if (result.fontType == FontType.FONT_AWESOME){
                    //console.log("Font Awesome is Checked");
                    addIcon();
                } else {
                    addText();
                }
            } else {
                addText();
            }

            function addText(){
                // Text
                if (result.text != undefined){
                    //console.log("Text: " + result.text);
                    fEditTextValue = result.text;
                } else {
                    //console.log("Text NOT SET");
                    fEditTextValue = "F";
                }
                fDisplay2.innerHTML = fEditTextValue;
            }

            function addIcon(){
                // Font Awesome
                if (result.fontAwesome != undefined){
                    //console.log("Font Awesome: " + result.fontAwesome);
                    fEditText = '<i class="fa '+result.fontAwesome+'"></i>';
                } else {
                    //console.log("Font Awesome NOT SET");
                    fEditText = '<i class="fa fa-thumbs-up"></i>';
                }
                fDisplay2.innerHTML = fEditText;
            }


            // Font Family
            if (result.fontFamily != undefined){
                //console.log("Font Family: " + result.fontFamily);
                fEditGoogleFontValue = result.fontFamily;
            } else {
                //console.log("Font Family NOT SET");
                fEditGoogleFontValue = "Montserrat";
            }
            fDisplay2.style.fontFamily = fEditGoogleFontValue;
            document.getElementById("googleFontStylesheet").setAttribute('href', 'https://fonts.googleapis.com/css?family='+fEditGoogleFontValue);

            htmlOutput();

            var designSettings = buildDesignSettings(result);

            if (!shouldDownload && typeof previewFaviconInActiveTab === "function") {
                previewFaviconInActiveTab(designSettings);
            }

            if (shouldDownload){
            var zip = new JSZip();
            
            // Generate a directory within the Zip file structure
            var img = zip.folder("images");

            // What sizes to download? 
            var size16 = document.getElementById("download_size1").checked;
            var size32 = document.getElementById("download_size2").checked;
            var size64 = document.getElementById("download_size3").checked;
            var size128 = document.getElementById("download_size4").checked;
            var size256 = document.getElementById("download_size5").checked;

            var readMe = document.getElementById("download_readme").checked;
            
            // What file type to download? 
            var fileTypeSelected = document.querySelector("input[name='download_type']:checked").getAttribute("id");
            var fileTypeWhich = "png";
            var fileMime = "image/png";
            if (fileTypeSelected == "download_type2"){
                fileTypeWhich = "jpg";
                fileMime = "image/jpeg";
            }

            function onDownloadError(){
                finishDownloading();
            }

            function captureFaviconAtSize(sizePx){
                return FaviconCanvas.renderToBase64(designSettings, sizePx, fileMime);
            }

            function addFaviconToZip(filename, encoded){
                img.file(filename, encoded, {base64: true});
            }

            // 64 x 64
            function faviconCanvasSize64(){
                if (size64 == true){
                    captureFaviconAtSize(64).then(function(favicon1){
                        addFaviconToZip("favicon64x64." + fileTypeWhich, favicon1);
                        faviconCanvasSize16();
                    }).catch(onDownloadError);
                } else {
                    faviconCanvasSize16();
                }
            }

            // 16 x 16
            function faviconCanvasSize16(){
                if (size16 == true){
                    captureFaviconAtSize(16).then(function(favicon2){
                        addFaviconToZip("favicon16x16." + fileTypeWhich, favicon2);
                        faviconCanvasSize32();
                    }).catch(onDownloadError);
                } else {
                    faviconCanvasSize32();
                }
            }

            // 32 x 32
            function faviconCanvasSize32(){
                if (size32 == true){
                    captureFaviconAtSize(32).then(function(favicon3){
                        addFaviconToZip("favicon32x32." + fileTypeWhich, favicon3);
                        faviconCanvasSize128();
                    }).catch(onDownloadError);
                } else {
                    faviconCanvasSize128();
                }
            }

            // 128 x 128
            function faviconCanvasSize128(){
                if (size128 == true){
                    captureFaviconAtSize(128).then(function(favicon4){
                        addFaviconToZip("favicon128x128." + fileTypeWhich, favicon4);
                        faviconCanvasSize256();
                    }).catch(onDownloadError);
                } else {
                    faviconCanvasSize256();
                }
            }

            // 256 x 256
            function faviconCanvasSize256(){
                if (size256 == true){
                    captureFaviconAtSize(256).then(function(favicon5){
                        addFaviconToZip("favicon256x256." + fileTypeWhich, favicon5);
                        faviconCanvasReadMe();
                    }).catch(onDownloadError);
                } else {
                    faviconCanvasReadMe();
                }
            }

            function faviconCanvasReadMe(){
                
                if (readMe == true){
                    
                    var readMeFile = "";
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            readMeFile = this.responseText;
                            zip.file("ReadMe.md", readMeFile);
                            downloadZip();
                        }
                    };
                    xhttp.open("GET", 'ReadMe.md', true);
                    xhttp.send();

                } else {
                    downloadZip();
                }

            }

            function downloadZip(){
                // Generate the zip file asynchronously
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    // Force down of the Zip file
                    saveAs(content, "favicon-creator.zip");
                    saveFaviconToHistory(result);
                    finishDownloading();
                }).catch(finishDownloading);
            }

            faviconCanvasSize64();
            }
            
        });

        firstLoad = false;

    }

    // Disable download button if now checkboxes are selected
    var sizeCheckboxes = document.querySelectorAll("input[name='download_size']");
    sizeCheckboxes.forEach(function (element)
    {
        element.addEventListener("click", function ()
        {
            var totalSizeChecked = 0;
            for (var i = 0; i < sizeCheckboxes.length; i++){
                var sizeCheckboxId = sizeCheckboxes[i].getAttribute("id");
                if (sizeCheckboxes[i].checked){
                    totalSizeChecked++;
                    switch(sizeCheckboxId){
                        case "download_size1":
                            chrome.storage.local.set({"download_size1": true});
                            break;
                        case "download_size2":
                            chrome.storage.local.set({"download_size2": true});
                            break;
                        case "download_size3":
                            chrome.storage.local.set({"download_size3": true});
                            break;
                        case "download_size4":
                            chrome.storage.local.set({"download_size4": true});
                            break;
                        case "download_size5":
                            chrome.storage.local.set({"download_size5": true});
                            break;
                    }
                } else {
                    switch(sizeCheckboxId){
                        case "download_size1":
                            chrome.storage.local.set({"download_size1": false});
                            break;
                        case "download_size2":
                            chrome.storage.local.set({"download_size2": false});
                            break;
                        case "download_size3":
                            chrome.storage.local.set({"download_size3": false});
                            break;
                        case "download_size4":
                            chrome.storage.local.set({"download_size4": false});
                            break;
                        case "download_size5":
                            chrome.storage.local.set({"download_size5": false});
                            break;
                    }
                }
            }
            if (totalSizeChecked > 0){
                if (!isDownloading){
                    setDownloadButtonEnabled(true);
                }
                fEditDownloadFeedback.innerText = "";
            } else {
                setDownloadButtonEnabled(false);
                fEditDownloadFeedback.innerText = "You need at least one image size selected in order to download your Favicon";
            }
            if (fEditFileHtml.checked){
                htmlOutput();
            }
        });
    });

});