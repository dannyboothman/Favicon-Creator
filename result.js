
document.addEventListener('DOMContentLoaded', function() {

    /* Var value set */
    var fEditTextColorValue;
    var fEditBgColorValue;
    var fEditSizeValue;
    var fEditTextValue;
    var fEditGoogleFontValue;
    /* End of Var value set */
    
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

        chrome.storage.local.get(['fontType', 'textColor', 'bgColor', 'fontSize', 'text', 'fontFamily', 'fontAwesome'], function(result) {


            // Text Color
            if (result.textColor != undefined){
                console.log("Text Color: " + result.textColor);
                fEditTextColorValue = result.textColor;
            } else {
                console.log("Text Color NOT SET");
                fEditTextColorValue = "#FFFFFF";
            }
            fDisplay2.style.color = fEditTextColorValue;


            // Background Color
            if (result.bgColor != undefined){
                console.log("BG Color: " + result.bgColor);
                fEditBgColorValue = result.bgColor;
            } else {
                console.log("BG Color NOT SET");
                fEditBgColorValue = "#FE145B";
            }
            fDisplay1.style.backgroundColor = fEditBgColorValue;

            
            // Font Size
            if (result.fontSize != undefined){
                console.log("Font Size: " + result.fontSize);
                fEditSizeValue = result.fontSize;
            } else {
                console.log("Font Size NOT SET");
                fEditSizeValue = "30";
            }
            fDisplay2.style.fontSize = fEditSizeValue + "px";


            // Font Type
            if (result.fontType != undefined){
                if (result.fontType == "2"){
                    console.log("Font Awesome is Checked");
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
                    console.log("Text: " + result.text);
                    fEditTextValue = result.text;
                } else {
                    console.log("Text NOT SET");
                    fEditTextValue = "F";
                }
                fDisplay2.innerHTML = fEditTextValue;
            }

            function addIcon(){
                // Font Awesome
                if (result.fontAwesome != undefined){
                    console.log("Font Awesome: " + result.fontAwesome);
                    fEditText = '<i class="fa '+result.fontAwesome+'"></i>';
                } else {
                    console.log("Font Awesome NOT SET");
                    fEditText = '<i class="fa fa-thumbs-up"></i>';
                }
                fDisplay2.innerHTML = fEditText;
            }


            // Font Family
            if (result.fontFamily != undefined){
                console.log("Font Family: " + result.fontFamily);
                fEditGoogleFontValue = result.fontFamily;
            } else {
                console.log("Font Family NOT SET");
                fEditGoogleFontValue = "Montserrat";
            }
            fDisplay2.style.fontFamily = fEditGoogleFontValue;
            document.getElementById("googleFontStylesheet").setAttribute('href', 'https://fonts.googleapis.com/css?family='+fEditGoogleFontValue);

        });


        var zip = new JSZip();
        // Add an top-level, arbitrary text file with contents
        zip.file("Hello.txt", "Hello World\n");
        // Generate a directory within the Zip file structure
        var img = zip.folder("images");

        // 64 x 64
        setTimeout(function(){
            html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                // Encode images for download
                var favicon1 = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                img.file("favicon64x64.png", favicon1, {base64: true});             
                faviconCanvasSize16();
            });
        }, 100);
        
        // 16 x 16
        function faviconCanvasSize16(){
            fDisplay1.style.width = "16px";
            fDisplay1.style.height = "16px";
            fDisplay2.style.lineHeight = "16px";
            fDisplay2.style.fontSize = (fEditSizeValue/4) + "px";
            setTimeout(function(){
                html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                    // Encode images for download
                    var favicon2 = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                    img.file("favicon16x16.png", favicon2, {base64: true});             
                    faviconCanvasSize32();
                });
            }, 100);
        }

        // 32 x 32
        function faviconCanvasSize32(){
            fDisplay1.style.width = "32px";
            fDisplay1.style.height = "32px";
            fDisplay2.style.lineHeight = "32px";
            fDisplay2.style.fontSize = (fEditSizeValue/2) + "px";
            setTimeout(function(){
                html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                    // Encode images for download
                    var favicon3 = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                    img.file("favicon32x32.png", favicon3, {base64: true});             
                    faviconCanvasSize128();
                });
            }, 100);
        }

        // 128 x 128
        function faviconCanvasSize128(){
            fDisplay1.style.width = "128px";
            fDisplay1.style.height = "128px";
            fDisplay2.style.lineHeight = "128px";
            fDisplay2.style.fontSize = (fEditSizeValue*2) + "px";
            setTimeout(function(){
                html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                    // Encode images for download
                    var favicon4 = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                    img.file("favicon128x128.png", favicon4, {base64: true});             
                    faviconCanvasSize256();
                });
            }, 100);
        }

        // 256 x 256
        function faviconCanvasSize256(){
            fDisplay1.style.width = "256px";
            fDisplay1.style.height = "256px";
            fDisplay2.style.lineHeight = "256px";
            fDisplay2.style.fontSize = (fEditSizeValue*4) + "px";
            setTimeout(function(){
                html2canvas(document.querySelector("#favicon_display"), { logging: true}).then(canvas => {
                    // Encode images for download
                    var favicon5 = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                    img.file("favicon256x256.png", favicon5, {base64: true});             
                    downloadZip();
                });
            }, 100);
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

    }

});