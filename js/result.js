document.addEventListener('DOMContentLoaded', function() {
    var FileType = FaviconSettings.FileType;
    var FileOption = FaviconSettings.FileOption;

    /* Var value set */
    var fEditDownloadButton = document.getElementById("favicon_download_button");
    var fEditDownloadFeedback = document.getElementById("favicon_download_feedback");
    var fEditFileType1 = document.getElementById("download_type1");
    var fEditFileType2 = document.getElementById("download_type2");
    var fEditFileSvg = document.getElementById("download_svg");
    var fEditFileIco = document.getElementById("download_ico");
    var fEditFileApple = document.getElementById("download_apple");
    var fEditFileManifest = document.getElementById("download_manifest");
    var fEditFileHtml = document.getElementById("download_html");
    var fEditFileReadMe = document.getElementById("download_readme");
    var HISTORY_MAX = 30;
    var HISTORY_KEY = "faviconHistory";
    /* End of Var value set */

    function saveFaviconToHistory(result){
        var settings = FaviconDesign.buildDesignSettings(result);
        chrome.storage.local.get([HISTORY_KEY], function(stored){
            var history = Array.isArray(stored[HISTORY_KEY]) ? stored[HISTORY_KEY].slice() : [];
            if (history.length > 0 && FaviconDesign.settingsEqual(history[0].settings, settings)){
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

    function setFileOption(key, checked){
        var payload = {};
        payload[key] = checked ? FileOption.ENABLED : FileOption.DISABLED;
        chrome.storage.local.set(payload);
    }

    function restoreFileOption(result, key, checkbox, defaultEnabled){
        if (result[key] != undefined){
            checkbox.checked = result[key] == FileOption.ENABLED;
        } else {
            checkbox.checked = defaultEnabled !== false;
        }
    }

    // Set Local storage for checkboxes
    fEditFileType1.addEventListener("change", fChangeFileType1);
    function fChangeFileType1(){
        chrome.storage.local.set({fileType: FileType.PNG});
    }
    fEditFileType2.addEventListener("change", fChangeFileType2);
    function fChangeFileType2(){
        chrome.storage.local.set({fileType: FileType.JPG});
    }

    function bindPackOption(checkbox, storageKey){
        checkbox.addEventListener("change", function(){
            setFileOption(storageKey, checkbox.checked);
            updateDownloadAvailability();
        });
    }
    bindPackOption(fEditFileSvg, "fileSvg");
    bindPackOption(fEditFileIco, "fileIco");
    bindPackOption(fEditFileApple, "fileApple");
    bindPackOption(fEditFileManifest, "fileManifest");

    fEditFileHtml.addEventListener("change", fChangeFileHtml);
    function fChangeFileHtml(){
        setFileOption("fileHtml", fEditFileHtml.checked);
    }
    fEditFileReadMe.addEventListener("change", fChangeFileReadMe);
    function fChangeFileReadMe(){
        setFileOption("fileReadMe", fEditFileReadMe.checked);
    }

    var isDownloading = false;

    function setDownloadButtonEnabled(enabled) {
        fEditDownloadButton.disabled = !enabled;
        fEditDownloadButton.classList.toggle("favicon_download_button_disabled", !enabled);
    }

    function countCheckedSizes(){
        var sizeCheckboxes = document.querySelectorAll("input[name='download_size']");
        var total = 0;
        for (var i = 0; i < sizeCheckboxes.length; i++){
            if (sizeCheckboxes[i].checked){
                total++;
            }
        }
        return total;
    }

    function hasModernPackSelection(){
        return (
            fEditFileSvg.checked ||
            fEditFileIco.checked ||
            fEditFileApple.checked ||
            fEditFileManifest.checked
        );
    }

    function updateDownloadAvailability(){
        var hasSizes = countCheckedSizes() > 0;
        var hasPack = hasModernPackSelection();
        if (hasSizes || hasPack){
            if (!isDownloading){
                setDownloadButtonEnabled(true);
            }
            fEditDownloadFeedback.innerText = "";
        } else {
            setDownloadButtonEnabled(false);
            fEditDownloadFeedback.innerText =
                "Select at least one image size or modern pack option to download";
        }
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
        updateDownloadAvailability();
    }

    function buildHtmlSnippetLines(){
        var lines = [];
        var htmlOutputCodeType = fEditFileType2.checked ? "jpg" : "png";

        if (fEditFileSvg.checked){
            lines.push(
                '<link rel="icon" href="favicon.svg" type="image/svg+xml">'
            );
        }
        if (fEditFileIco.checked){
            lines.push(
                '<link rel="icon" href="favicon.ico" sizes="48x48">'
            );
        }
        if (fEditFileApple.checked){
            lines.push(
                '<link rel="apple-touch-icon" href="apple-touch-icon.png">'
            );
        }
        if (fEditFileManifest.checked){
            lines.push(
                '<link rel="manifest" href="site.webmanifest">'
            );
        }

        var sizeMap = {
            download_size1: { sizes: "16x16", file: "favicon16x16" },
            download_size2: { sizes: "32x32", file: "favicon32x32" },
            download_size3: { sizes: "64x64", file: "favicon64x64" },
            download_size4: { sizes: "128x128", file: "favicon128x128" },
            download_size5: { sizes: "256x256", file: "favicon256x256" }
        };
        var sizeCheckboxes = document.querySelectorAll("input[name='download_size']");
        for (var i = 0; i < sizeCheckboxes.length; i++){
            if (!sizeCheckboxes[i].checked){
                continue;
            }
            var meta = sizeMap[sizeCheckboxes[i].getAttribute("id")];
            if (!meta){
                continue;
            }
            lines.push(
                '<link rel="icon" sizes="' +
                    meta.sizes +
                    '" type="image/' +
                    htmlOutputCodeType +
                    '" href="images/' +
                    meta.file +
                    "." +
                    htmlOutputCodeType +
                    '">'
            );
        }

        return lines;
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

        chrome.storage.local.get(FaviconDesign.KEYS.concat([
            'download_size1', 'download_size2', 'download_size3', 'download_size4', 'download_size5',
            'fileType', 'fileHtml', 'fileReadMe',
            'fileSvg', 'fileIco', 'fileApple', 'fileManifest'
        ]), function(result) {

            // 16 x 16
            if (result.download_size1 != undefined){
                document.getElementById("download_size1").checked = result.download_size1 == true;
            } else {
                document.getElementById("download_size1").checked = true;
            }

            // 32 x 32
            if (result.download_size2 != undefined){
                document.getElementById("download_size2").checked = result.download_size2 == true;
            } else {
                document.getElementById("download_size2").checked = true;
            }

            // 64 x 64
            if (result.download_size3 != undefined){
                document.getElementById("download_size3").checked = result.download_size3 == true;
            } else {
                document.getElementById("download_size3").checked = true;
            }

            // 128 x 128
            if (result.download_size4 != undefined){
                document.getElementById("download_size4").checked = result.download_size4 == true;
            } else {
                document.getElementById("download_size4").checked = false;
            }

            if (result.download_size5 != undefined){
                document.getElementById("download_size5").checked = result.download_size5 == true;
            } else {
                document.getElementById("download_size5").checked = false;
            }

            restoreFileOption(result, "fileHtml", fEditFileHtml, true);
            restoreFileOption(result, "fileReadMe", fEditFileReadMe, true);
            restoreFileOption(result, "fileSvg", fEditFileSvg, true);
            restoreFileOption(result, "fileIco", fEditFileIco, true);
            restoreFileOption(result, "fileApple", fEditFileApple, true);
            restoreFileOption(result, "fileManifest", fEditFileManifest, true);

            // File Type
            if (result.fileType != undefined){
                if (result.fileType == FileType.PNG){
                    fEditFileType1.checked = true;
                } else {
                    fEditFileType2.checked = true;
                }
            } else {
                fEditFileType1.checked = true;
            }

            updateDownloadAvailability();

            var designSettings = FaviconDesign.applyPreviewStyles(
                fDisplay1,
                fDisplay2,
                result,
                { googleFontStylesheetId: "googleFontStylesheet" }
            );

            if (!shouldDownload && typeof previewFaviconInActiveTab === "function") {
                previewFaviconInActiveTab(designSettings);
            }

            if (shouldDownload){
            fEditDownloadFeedback.innerText = "";
            var zip = new JSZip();

            // Generate a directory within the Zip file structure
            var img = zip.folder("images");

            // What sizes to download?
            var size16 = document.getElementById("download_size1").checked;
            var size32 = document.getElementById("download_size2").checked;
            var size64 = document.getElementById("download_size3").checked;
            var size128 = document.getElementById("download_size4").checked;
            var size256 = document.getElementById("download_size5").checked;

            var wantSvg = fEditFileSvg.checked;
            var wantIco = fEditFileIco.checked;
            var wantApple = fEditFileApple.checked;
            var wantManifest = fEditFileManifest.checked;
            var wantHtml = fEditFileHtml.checked;
            var readMe = fEditFileReadMe.checked;

            // What file type to download?
            var fileTypeSelected = document.querySelector("input[name='download_type']:checked").getAttribute("id");
            var fileTypeWhich = "png";
            var fileMime = "image/png";
            if (fileTypeSelected == "download_type2"){
                fileTypeWhich = "jpg";
                fileMime = "image/jpeg";
            }

            function onDownloadError(message){
                finishDownloading();
                fEditDownloadFeedback.innerText =
                    message || "Download failed. Please try again.";
            }

            function captureFaviconAtSize(sizePx, mime){
                return FaviconCanvas.renderToBase64(
                    designSettings,
                    sizePx,
                    mime || fileMime
                );
            }

            function addFaviconToZip(filename, encoded){
                img.file(filename, encoded, {base64: true});
            }

            function addRootPng(filename, encoded){
                zip.file(filename, encoded, {base64: true});
            }

            function captureSelectedSizes(){
                var sizeSpecs = [
                    { enabled: size16, px: 16 },
                    { enabled: size32, px: 32 },
                    { enabled: size64, px: 64 },
                    { enabled: size128, px: 128 },
                    { enabled: size256, px: 256 }
                ];
                return Promise.all(
                    sizeSpecs
                        .filter(function(spec){ return spec.enabled; })
                        .map(function(spec){
                            return captureFaviconAtSize(spec.px).then(function(encoded){
                                addFaviconToZip(
                                    "favicon" + spec.px + "x" + spec.px + "." + fileTypeWhich,
                                    encoded
                                );
                            });
                        })
                );
            }

            function faviconPackSvg(){
                if (wantSvg && globalFaviconSvg()){
                    try {
                        zip.file("favicon.svg", FaviconSvg.renderToString(designSettings));
                    } catch (err) {
                        onDownloadError("Could not generate the SVG favicon.");
                        return;
                    }
                }
                faviconPackApple();
            }

            function globalFaviconSvg(){
                return typeof FaviconSvg !== "undefined" &&
                    typeof FaviconSvg.renderToString === "function";
            }

            function faviconPackApple(){
                if (wantApple){
                    captureFaviconAtSize(180, "image/png").then(function(encoded){
                        addRootPng("apple-touch-icon.png", encoded);
                        faviconPackManifest();
                    }).catch(onDownloadError);
                } else {
                    faviconPackManifest();
                }
            }

            function faviconPackManifest(){
                if (!wantManifest){
                    faviconPackIco();
                    return;
                }
                captureFaviconAtSize(192, "image/png").then(function(icon192){
                    addRootPng("android-chrome-192x192.png", icon192);
                    return captureFaviconAtSize(512, "image/png");
                }).then(function(icon512){
                    addRootPng("android-chrome-512x512.png", icon512);
                    var manifest = {
                        name: "App",
                        short_name: "App",
                        icons: [
                            {
                                src: "android-chrome-192x192.png",
                                sizes: "192x192",
                                type: "image/png"
                            },
                            {
                                src: "android-chrome-512x512.png",
                                sizes: "512x512",
                                type: "image/png"
                            }
                        ]
                    };
                    zip.file(
                        "site.webmanifest",
                        JSON.stringify(manifest, null, 2)
                    );
                    faviconPackIco();
                }).catch(onDownloadError);
            }

            function faviconPackIco(){
                if (!wantIco || typeof FaviconIco === "undefined"){
                    faviconPackHtml();
                    return;
                }
                Promise.all([
                    captureFaviconAtSize(16, "image/png"),
                    captureFaviconAtSize(32, "image/png")
                ]).then(function(parts){
                    var icoBytes = FaviconIco.buildFromBase64Pngs([
                        { width: 16, height: 16, base64: parts[0] },
                        { width: 32, height: 32, base64: parts[1] }
                    ]);
                    zip.file("favicon.ico", icoBytes);
                    faviconPackHtml();
                }).catch(onDownloadError);
            }

            function faviconPackHtml(){
                if (wantHtml){
                    var lines = buildHtmlSnippetLines();
                    zip.file("html.html", lines.join("\n") + "\n");
                }
                faviconCanvasReadMe();
            }

            function faviconCanvasReadMe(){

                if (readMe == true){

                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            zip.file("ReadMe.md", this.responseText);
                            downloadZip();
                        } else if (this.readyState == 4) {
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
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    saveAs(content, "favicon-creator.zip");
                    saveFaviconToHistory(result);
                    finishDownloading();
                }).catch(function(){
                    onDownloadError("Could not generate the zip file. Please try again.");
                });
            }

            captureSelectedSizes()
                .then(faviconPackSvg)
                .catch(function(){
                    onDownloadError("Could not render favicon images. Please try again.");
                });
            }

        });

        firstLoad = false;

    }

    // Disable download button if no checkboxes are selected
    var sizeCheckboxes = document.querySelectorAll("input[name='download_size']");
    sizeCheckboxes.forEach(function (element)
    {
        element.addEventListener("click", function ()
        {
            for (var i = 0; i < sizeCheckboxes.length; i++){
                var sizeCheckboxId = sizeCheckboxes[i].getAttribute("id");
                if (sizeCheckboxes[i].checked){
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
            updateDownloadAvailability();
        });
    });

});
