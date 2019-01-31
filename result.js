
document.addEventListener('DOMContentLoaded', function() {

    /* Var value set */
    var fEditTextColorValue;
    var fEditBgColorValue;
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

    fEditDownloadButton.addEventListener('click', function() {
        getFavicon();
    });

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

        var faviconHtml = '';
            faviconHtml += '<div id="favicon_display">';
                faviconHtml += '<div id="favicon_display_content"></div>';
            faviconHtml += '</div>';

        var faviconHtmlContainer = document.getElementById("favicon_display_container");

        faviconHtmlContainer.innerHTML = faviconHtml;

        fDisplay1 = document.getElementById("favicon_display");
        fDisplay2 = document.getElementById("favicon_display_content");

        var borderLive = false;

        chrome.storage.local.get(['fontType', 'textColor', 'bgColor', 'fontSize', 'borderRadius', 'text', 'textStyle1', 'textStyle2', 'textStyle3', 'textStyle4', 'fontFamily', 'fontAwesome', 'border', 'borderColor', 'borderWidth', 'download_size1', 'download_size2', 'download_size3', 'download_size4', 'download_size5', 'fileType', 'fileHtml', 'fileReadMe'], function(result) {

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
                fEditDownloadButton.classList.remove("favicon_download_button_disabled");
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
            
        });

        if (firstLoad == false){
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

            // 64 x 64
            setTimeout(function(){
                fDisplay1.style.width = "64px";
                fDisplay1.style.height = "64px";
                fDisplay2.style.lineHeight = "64px";
                if (borderLive){ 
                    fDisplay1.style.height = "54px";
                    fDisplay2.style.lineHeight = "54px"; 
                    fDisplay1.style.border = borderWidth + "px " + borderStyle + " " + borderColor;
                }
                if (size64 == true){
                    html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                        // Encode images for download
                        var favicon1 = canvas.toDataURL('image/'+ fileTypeWhich).replace(/^data:image\/(png|jpg);base64,/, '');

                        img.file("favicon64x64." + fileTypeWhich, favicon1, {base64: true});             
                        faviconCanvasSize16();
                    });
                } else {
                    faviconCanvasSize16();
                }
            }, 100);
            
            // 16 x 16
            function faviconCanvasSize16(){
                fDisplay1.style.width = "16px";
                fDisplay1.style.height = "16px";
                fDisplay2.style.lineHeight = "16px";
                if (borderLive){ 
                    fDisplay1.style.height = "14px";
                    fDisplay2.style.lineHeight = "14px"; 
                    fDisplay1.style.border = (borderWidth/4) + "px " + borderStyle + " " + borderColor;
                }
                fDisplay2.style.fontSize = (fEditSizeValue/4) + "px";
                setTimeout(function(){
                    if (size16 == true){
                        html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                            // Encode images for download
                            var favicon2 = canvas.toDataURL('image/'+ fileTypeWhich).replace(/^data:image\/(png|jpg);base64,/, '');
                            img.file("favicon16x16." + fileTypeWhich, favicon2, {base64: true});             
                            faviconCanvasSize32();
                        });
                    } else {
                        faviconCanvasSize32();
                    }
                }, 100);
            }

            // 32 x 32
            function faviconCanvasSize32(){
                fDisplay1.style.width = "32px";
                fDisplay1.style.height = "32px";
                fDisplay2.style.lineHeight = "32px";
                if (borderLive){ 
                    fDisplay1.style.height = "28px";
                    fDisplay2.style.lineHeight = "28px";
                    fDisplay1.style.border = (borderWidth/2) + "px " + borderStyle + " " + borderColor;
                }
                fDisplay2.style.fontSize = (fEditSizeValue/2) + "px";
                setTimeout(function(){
                    if (size32 == true){
                        html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                            // Encode images for download
                            var favicon3 = canvas.toDataURL('image/'+ fileTypeWhich).replace(/^data:image\/(png|jpg);base64,/, '');
                            img.file("favicon32x32." + fileTypeWhich, favicon3, {base64: true});             
                            faviconCanvasSize128();
                        });
                    } else {
                        faviconCanvasSize128();
                    }
                }, 100);
            }

            // 128 x 128
            function faviconCanvasSize128(){
                fDisplay1.style.width = "128px";
                fDisplay1.style.height = "128px";
                fDisplay2.style.lineHeight = "128px";
                if (borderLive){ 
                    fDisplay1.style.height = "108px";
                    fDisplay2.style.lineHeight = "108px";
                    fDisplay1.style.border = (borderWidth*2) + "px " + borderStyle + " " + borderColor; 
                }                
                fDisplay2.style.fontSize = (fEditSizeValue*2) + "px";
                setTimeout(function(){
                    if (size128 == true){
                        html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                            // Encode images for download
                            var favicon4 = canvas.toDataURL('image/'+ fileTypeWhich).replace(/^data:image\/(png|jpg);base64,/, '');
                            img.file("favicon128x128." + fileTypeWhich, favicon4, {base64: true});             
                            faviconCanvasSize256();
                        });
                    } else {
                        faviconCanvasSize256();
                    }
                }, 100);
            }

            // 256 x 256
            function faviconCanvasSize256(){
                fDisplay1.style.width = "256px";
                fDisplay1.style.height = "256px";
                fDisplay2.style.lineHeight = "256px";
                if (borderLive){ 
                    fDisplay1.style.height = "216px";
                    fDisplay2.style.lineHeight = "216px";
                    fDisplay1.style.border = (borderWidth*4) + "px " + borderStyle + " " + borderColor;
                }
                fDisplay2.style.fontSize = (fEditSizeValue*4) + "px";
                setTimeout(function(){
                    if (size256 == true){
                        html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                            // Encode images for download
                            var favicon5 = canvas.toDataURL('image/'+ fileTypeWhich).replace(/^data:image\/(png|jpg);base64,/, '');
                            img.file("favicon256x256." + fileTypeWhich, favicon5, {base64: true});             
                            faviconCanvasReadMe();
                        });
                    } else {
                        faviconCanvasReadMe();
                    }
                }, 100);
            }

            function faviconCanvasReadMe(){
                
                if (readMe == true){
                    
                    var readMeFile = "";
                    var xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            readMeFile = this.responseText;
                            zip.file("ReadMe.txt", readMeFile);
                            downloadZip();
                        }
                    };
                    xhttp.open("GET", 'ReadMe.txt', true);
                    xhttp.send();

                } else {
                    downloadZip();
                }

            }


            //faviconHtmlContainer.remove();
            function downloadZip(){
                fDisplay1.style.width = "64px";
                fDisplay1.style.height = "64px";
                fDisplay2.style.lineHeight = "64px";
                fDisplay2.style.fontSize = fEditSizeValue + "px";
                // Generate the zip file asynchronously
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                    // Force down of the Zip file
                    saveAs(content, "favicon-creator.zip");
                });
            }
        } else {
            firstLoad = false;
            setTimeout(function(){
                html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                    
                    var faviconForPage = canvas.toDataURL();
                    
                    var faviconCodeForPage = 'var faviconPage = document.createElement("link");' +
                                                'faviconPage.setAttribute("rel", "icon");' +
                                                'faviconPage.type = "image/x-icon";' +
                                                'faviconPage.href = "'+faviconForPage+'";' +
                                                'var links = document.head.getElementsByTagName("link");' +
                                                'for (i=0; i<links.length; i++) {' +
                                                    'if (links[i].getAttribute("rel").match(/^(shortcut )?icon$/i)) {' +
                                                        'document.head.removeChild(links[i]);' +
                                                    '}' +
                                                '}' +
                                                'document.head.appendChild(faviconPage);';

                    chrome.tabs.executeScript(null, {
                        code: faviconCodeForPage
                    });
                    
                });
            }, 100);


        }

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
                fEditDownloadButton.classList.remove("favicon_download_button_disabled");
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