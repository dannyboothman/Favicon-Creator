
document.addEventListener('DOMContentLoaded', function() {

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
    /* End of Var value set */

    // Set Local storage for checkboxes
    fEditFileType1.addEventListener("change", fChangeFileType1);    
    function fChangeFileType1(){
        chrome.storage.local.set({fileType: 1});
        htmlOutput();
    }
    fEditFileType2.addEventListener("change", fChangeFileType2);    
    function fChangeFileType2(){
        chrome.storage.local.set({fileType: 2});
        htmlOutput();
    }
    fEditFileHtml.addEventListener("change", fChangeFileHtml);
    function fChangeFileHtml(){
        if (fEditFileHtml.checked){
            chrome.storage.local.set({fileHtml: 1});
            htmlOutput();
        } else {
            chrome.storage.local.set({fileHtml: 2});
            document.getElementById("html_output_container").style.display = "none";
        }
    }
    fEditFileReadMe.addEventListener("change", fChangeFileReadMe);
    function fChangeFileReadMe(){
        if (fEditFileReadMe.checked){
            chrome.storage.local.set({fileReadMe: 1});
        } else {
            chrome.storage.local.set({fileReadMe: 2});
        }
    }

    var isDownloading = false;

    fEditDownloadButton.addEventListener('click', function() {
        if (isDownloading || fEditDownloadButton.classList.contains("favicon_download_button_disabled")){
            return;
        }
        if (firstLoad === false){
            isDownloading = true;
            fEditDownloadButton.textContent = "Downloading";
            fEditDownloadButton.classList.add("favicon_download_button_disabled");
        }
        getFavicon();
    });

    function finishDownloading(){
        isDownloading = false;
        fEditDownloadButton.textContent = "Download";
        if (document.querySelector("input[name='download_size']:checked")){
            fEditDownloadButton.classList.remove("favicon_download_button_disabled");
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

        chrome.storage.local.get(['fontType', 'textColor', 'bgColor', 'bgColor2', 'bgType', 'fontSize', 'borderRadius', 'text', 'textStyle1', 'textStyle2', 'textStyle3', 'textStyle4', 'fontFamily', 'fontAwesome', 'border', 'borderColor', 'borderWidth', 'download_size1', 'download_size2', 'download_size3', 'download_size4', 'download_size5', 'fileType', 'fileHtml', 'fileReadMe'], function(result) {

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
                    fEditDownloadButton.classList.remove("favicon_download_button_disabled");
                }
                fEditDownloadFeedback.innerText = "";
            } else {
                fEditDownloadButton.classList.add("favicon_download_button_disabled");
                fEditDownloadFeedback.innerText = "You need at least one image size selected in order to download your Favicon";
            }

            // File HTML
            if (result.fileHtml != undefined){
                console.log("File HTML: " + result.fileHtml);
                if (result.fileHtml == 1){
                    fEditFileHtml.checked = true;
                    document.getElementById("html_output_container").style.display = "block";
                } else {
                    fEditFileHtml.checked = false;
                    console.log("Did this run")
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
                if (result.fileReadMe == 1){
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
                if (result.fileType == 1){
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
                console.log("Bold: " + result.textStyle1);
                if (result.textStyle1 == true){
                    fDisplay2.style.fontWeight = "bold";
                } else {
                    fDisplay2.style.fontWeight = "normal";
                }
            } else {
                console.log("Bold Not set");
                fDisplay2.style.fontWeight = "normal";
            }

            // Text Style: Italic
            if (result.textStyle2 != undefined){
                console.log("Italic: " + result.textStyle2);
                if (result.textStyle2 == true){
                    fDisplay2.style.fontStyle = "italic";
                } else {
                    fDisplay2.style.fontStyle = "normal";
                }
            } else {
                console.log("Italic Not set");
                fDisplay2.style.fontStyle = "normal";
            }

            // Text Style: Underline
            if (result.textStyle3 != undefined){
                console.log("Underline: " + result.textStyle3);
                if (result.textStyle3 == true){
                    fDisplay2.style.textDecoration = "underline";
                } else {
                    fDisplay2.style.textDecoration = "inherit";
                }
            } else {
                console.log("Underline Not set");
                fDisplay2.style.textDecoration = "inherit";
            }

            // Text Style: Strike
            if (result.textStyle3 != undefined && result.textStyle3 != true){
                if (result.textStyle4 != undefined){
                    console.log("Strike: " + result.textStyle4);
                    if (result.textStyle4 == true){
                        fDisplay2.style.textDecoration = "line-through";
                    } else {
                        fDisplay2.style.textDecoration = "inherit";
                    }
                } else {
                    console.log("Strike Not set");
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
            if (result.bgType != undefined && result.bgType == 2){
                fEditBgColorValue = result.bgColor ? result.bgColor : "#FE145B";
                fEditBgColorValue2 =  result.bgColor2 ? result.bgColor2 : "#000";
                fDisplay1.style.background = `linear-gradient(90deg, ${fEditBgColorValue} 0%, ${fEditBgColorValue2} 78%)`;
            }

            // Border Radius
            if (result.borderRadius != undefined){
                //console.log("Border Radius: " + result.fontSize);
                fEditBorderRadiusValue = result.borderRadius;
            } else {
                //console.log("Border Radius NOT SET");
                fEditBorderRadiusValue = "0";
            }
            fDisplay1.style.borderRadius = fEditBorderRadiusValue + "px";
            
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
                if (result.border == "1"){
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
                if (result.fontType == "2"){
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
            if (fileTypeSelected == "download_type2"){
                fileTypeWhich = "jpg";
            }

            // Keep a stable decoy visible; resize the real favicon inside a clipped slot for capture
            var previewContainer = document.getElementById("favicon_display_container");
            var captureSource = document.getElementById("favicon_display");
            var captureContent = document.getElementById("favicon_display_content");
            var captureSlot = document.createElement("div");
            captureSlot.id = "favicon_capture_slot";
            var previewDecoy = captureSource.cloneNode(true);
            previewDecoy.id = "favicon_display_decoy";
            var decoyContent = previewDecoy.querySelector("#favicon_display_content");
            if (decoyContent){
                decoyContent.removeAttribute("id");
                decoyContent.style.display = "table-cell";
                decoyContent.style.verticalAlign = "middle";
                // Match the resting preview; capture may have left a sized line-height on the source clone
                decoyContent.style.lineHeight = "";
            }
            previewDecoy.style.width = "";
            previewDecoy.style.height = "";
            previewContainer.appendChild(previewDecoy);
            previewContainer.appendChild(captureSlot);
            captureSlot.appendChild(captureSource);

            function teardownCapturePreview(){
                if (previewDecoy.parentNode){
                    previewDecoy.parentNode.removeChild(previewDecoy);
                }
                if (captureSource && previewContainer){
                    previewContainer.insertBefore(captureSource, previewContainer.firstChild);
                }
                if (captureSlot.parentNode){
                    captureSlot.parentNode.removeChild(captureSlot);
                }
                if (captureSource){
                    captureSource.style.width = "";
                    captureSource.style.height = "";
                    captureSource.style.border = borderLive ? (borderWidth + "px " + borderStyle + " " + borderColor) : "";
                }
                if (captureContent){
                    captureContent.style.fontSize = fEditSizeValue + "px";
                    captureContent.style.lineHeight = "";
                }
            }

            function onDownloadError(){
                teardownCapturePreview();
                finishDownloading();
            }

            function captureFaviconAtSize(sizePx, fontSizePx, borderScale, borderedHeightPx){
                return new Promise(function(resolve, reject){
                    captureSource.style.width = sizePx + "px";
                    captureSource.style.height = sizePx + "px";
                    if (captureContent){
                        captureContent.style.lineHeight = sizePx + "px";
                        captureContent.style.fontSize = fontSizePx + "px";
                    }
                    if (borderLive){
                        captureSource.style.height = borderedHeightPx + "px";
                        if (captureContent){
                            captureContent.style.lineHeight = borderedHeightPx + "px";
                        }
                        captureSource.style.border = (borderWidth * borderScale) + "px " + borderStyle + " " + borderColor;
                    }

                    setTimeout(function(){
                        html2canvas(captureSource, {
                            logging: true,
                            width: sizePx,
                            height: sizePx,
                            windowWidth: 300,
                            windowHeight: 300,
                            scale: 1
                        }).then(function(canvas){
                            var encoded = canvas.toDataURL('image/'+ fileTypeWhich).replace(/^data:image\/(png|jpg);base64,/, '');
                            resolve(encoded);
                        }).catch(reject);
                    }, 100);
                });
            }

            function addFaviconToZip(filename, encoded){
                img.file(filename, encoded, {base64: true});
            }

            // 64 x 64
            function faviconCanvasSize64(){
                if (size64 == true){
                    captureFaviconAtSize(64, fEditSizeValue, 1, 54).then(function(favicon1){
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
                    captureFaviconAtSize(16, fEditSizeValue/4, 0.25, 14).then(function(favicon2){
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
                    captureFaviconAtSize(32, fEditSizeValue/2, 0.5, 28).then(function(favicon3){
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
                    captureFaviconAtSize(128, fEditSizeValue*2, 2, 108).then(function(favicon4){
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
                    captureFaviconAtSize(256, fEditSizeValue*4, 4, 216).then(function(favicon5){
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
                teardownCapturePreview();
                // Generate the zip file asynchronously
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    // Force down of the Zip file
                    saveAs(content, "favicon-creator.zip");
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
                    fEditDownloadButton.classList.remove("favicon_download_button_disabled");
                }
                fEditDownloadFeedback.innerText = "";
            } else {
                fEditDownloadButton.classList.add("favicon_download_button_disabled");
                fEditDownloadFeedback.innerText = "You need at least one image size selected in order to download your Favicon";
            }
            if (fEditFileHtml.checked){
                htmlOutput();
            }
        });
    });

});