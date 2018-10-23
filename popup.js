
/*getFontawesome();
function getFontawesome(){

    var fontAwesomeUrl = 'https://use.fontawesome.com/releases/v5.3.1/css/all.css';
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var fontAwesome = this.responseText;

            var res = fontAwesome.split('.');
            
            var fontAwesomeResult = new Array();
            for (var i = 0; i < res.length; i++){
                var newRes = res[i].substr(0, res[i].indexOf(':'));
                if (newRes.substring(0, 2) == "fa"){
                    if ((!newRes.match(/{/g)) && (!newRes.match(/,/g))){
                        fontAwesomeResult.push(newRes);
                    }
                    
                }
            }

            var fEditFontAwesome = document.getElementById("favicon_edit_font_awesome");
            var fontAwesomeHtml = '';
            for(var j = 0; j < fontAwesomeResult.length; j++){
                fontAwesomeHtml += '<div class="font_awesome_item"><i class="fas '+fontAwesomeResult[j]+'" onerror="console.log('+fontAwesomeResult[j]+')"></i><span>'+fontAwesomeResult[j]+'</span></div>';
            }

            fEditFontAwesome.innerHTML = fontAwesomeHtml;


        }
    };
    xhttp.open("GET", fontAwesomeUrl, true);
    xhttp.send();

}*/
/*
function getFontawesome(){
    
    var fontAwesomeUrl = '/fontAwesome/all.js';
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var fontAwesome = this.responseText;

            //console.log(fontAwesome);

            var res = fontAwesome.split('var icons = {');
            console.log(res)

            
            var res = fontAwesome.split('"').pop().split('":')[0];


            console.log(res);


        }
    };
    xhttp.open("GET", fontAwesomeUrl, true);
    xhttp.send();

}*/

document.addEventListener('DOMContentLoaded', function() {

    /* Favicon Display */
    var fDisplay1;
    var fDisplay2;

    /* Favicon Type Nav */
    var fEditType1 = document.getElementById("favicon_edit_type1");
    var fEditType2 = document.getElementById("favicon_edit_type2");
    var fEditType1Container = document.getElementById("favion_edit_type_text");
    var fEditType2Container = document.getElementById("favion_edit_type_fontawesome");
    
    fEditType1.addEventListener('click', function() {
        fEditType1Container.style.display = "block";
        fEditType2Container.style.display = "none";
    });

    fEditType2.addEventListener('click', function() {
        fEditType2Container.style.display = "block";
        fEditType1Container.style.display = "none";
    });

    /* End of Favicon Type Nav */

    /* Var value set */
    var fEditTextColorValue;
    var fEditBgColorValue;
    var fEditSizeValue;
    var fEditTextValue;
    var fEditGoogleFontValue;
    var googleFontsMarkup;
    /* End of Var value set */

    /* Var input set */
    var fEditTextColor = document.getElementById("favicon_edit_text_color");
    var fEditBgColor = document.getElementById("favicon_edit_bg_color");
    var fEditSize = document.getElementById("favicon_edit_font_size");
    var fEditText = document.getElementById("favicon_edit_text");
    var fEditGoogleFont = document.getElementById("favicon_edit_google_font");
    /* End of Var input set  */
    

    /* Text Color */
    fEditTextColor.addEventListener("input", fChangeTextColor);
    function fChangeTextColor(){
        fEditTextColorValue = document.getElementById("favicon_edit_text_color").value;
        chrome.storage.local.set({textColor: fEditTextColorValue});
        getFavicon();
    }
    /* End of Text Color */

    
    /* BG Color */
    fEditBgColor.addEventListener("input", fChangeBgColor);
    function fChangeBgColor(){
        fEditBgColorValue = document.getElementById("favicon_edit_bg_color").value;
        chrome.storage.local.set({bgColor: fEditBgColorValue});
        getFavicon();
    }
    /* End of BG Color */


    /* Font Size */
    fEditSize.addEventListener("input", fChangeFontSize);
    function fChangeFontSize(){
        fEditSizeValue = document.getElementById("favicon_edit_font_size").value;
        chrome.storage.local.set({fontSize: fEditSizeValue});
        getFavicon();
    }
    /* End of Font Size */   


    /* Text */
    fEditText.addEventListener("change", fChangeText);
    fEditText.addEventListener("keyup", fChangeText);
    function fChangeText(){
        fEditTextValue = document.getElementById("favicon_edit_text").value;
        chrome.storage.local.set({text: fEditTextValue});
        getFavicon();
    }
    /* End of Text */   


    /* Google Fonts */
    fEditGoogleFont.addEventListener("change", fChangeGoogleFont);    
    function fChangeGoogleFont(){
        fEditGoogleFontValue = document.getElementById("favicon_edit_google_font").value;
        chrome.storage.local.set({fontFamily: fEditGoogleFontValue});
        getFavicon();
    }
    /* End of Google Fonts */



    var resultsPage = document.getElementById("main_nav2");
    resultsPage.addEventListener("click", changePageResults);
    function changePageResults(){
        var faviconDiv = document.getElementById("favicon_display_container").innerHTML;
        faviconDiv = encodeURIComponent(faviconDiv);
        window.location.href = "result.html?favicon="+faviconDiv;
    }





    /* Google Fonts */

    var googleFontsUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBjoLHzfKeMU31kCbFXE7XrmrwzMWypxTE&sort=popularity';
    
    chrome.storage.local.get(['googleFonts'], function(result) {
        if (result.googleFonts != undefined){
            console.log("Has google fonts")
            fEditGoogleFont.innerHTML = result.googleFonts;
            getFavicon();
        } else {
            console.log("Get Google Fonts");
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var googleFonts = JSON.parse(this.responseText);
                    googleFonts = googleFonts.items;
                    googleFontsMarkup =
                            googleFonts.map(function (item) {
                                return '<option value="'+item.family+'">'+item.family+'</option>';
                            }).join('');
                    
                    fEditGoogleFont.innerHTML = googleFontsMarkup;
                    chrome.storage.local.set({googleFonts: googleFontsMarkup});
                    getFavicon();
                }
            };
            xhttp.open("GET", googleFontsUrl, true);
            xhttp.send();
        }
    });



    
    var faviconCreated = false;
    function getFavicon(){

        if (faviconCreated === false){
            faviconCreated = true;
            
            var faviconHtml = '';
                faviconHtml += '<div id="favicon_display">';
                    faviconHtml += '<div id="favicon_display_content"></div>';
                faviconHtml += '</div>';

            document.getElementById("favicon_display_container").innerHTML = faviconHtml;

            fDisplay1 = document.getElementById("favicon_display");
            fDisplay2 = document.getElementById("favicon_display_content");
        }

        chrome.storage.local.get(['textColor', 'bgColor', 'fontSize', 'text', 'fontFamily'], function(result) {


            // Text Color
            if (result.textColor != undefined){
                console.log("Text Color: " + result.textColor);
                fEditTextColorValue = result.textColor;
            } else {
                console.log("Text Color NOT SET");
                fEditTextColorValue = "#FFFFFF";
            }
            fEditTextColor.value = fEditTextColorValue;
            fDisplay2.style.color = fEditTextColorValue;


            // Background Color
            if (result.bgColor != undefined){
                console.log("BG Color: " + result.bgColor);
                fEditBgColorValue = result.bgColor;
            } else {
                console.log("BG Color NOT SET");
                fEditBgColorValue = "#FE145B";
            }
            fEditBgColor.value = fEditBgColorValue;
            fDisplay1.style.backgroundColor = fEditBgColorValue;

            
            // Font Size
            if (result.fontSize != undefined){
                console.log("Font Size: " + result.fontSize);
                fEditSizeValue = result.fontSize;
            } else {
                console.log("Font Size NOT SET");
                fEditSizeValue = "30";
            }
            fEditSize.value = fEditSizeValue;
            fDisplay2.style.fontSize = fEditSizeValue + "px";
            document.getElementById("favicon_edit_font_size_text").innerHTML = "(" + fEditSizeValue + "px)";


            // Text
            if (result.text != undefined){
                console.log("Text: " + result.text);
                fEditTextValue = result.text;
            } else {
                console.log("Text NOT SET");
                fEditTextValue = "F";
            }
            fEditText.value = fEditTextValue;
            fDisplay2.innerHTML = fEditTextValue;


            // Font Family
            if (result.fontFamily != undefined){
                console.log("Font Family: " + result.fontFamily);
                fEditGoogleFontValue = result.fontFamily;
            } else {
                console.log("Font Family NOT SET");
                fEditGoogleFontValue = "Montserrat";
            }
            fEditGoogleFont.value = fEditGoogleFontValue;
            fDisplay2.style.fontFamily = fEditGoogleFontValue;
            document.getElementById("googleFontStylesheet").setAttribute('href', 'https://fonts.googleapis.com/css?family='+fEditGoogleFontValue);

        });

    }

});

