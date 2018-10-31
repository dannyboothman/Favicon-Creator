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
        chrome.storage.local.set({fontType: "1"});
        getFavicon();
    });

    fEditType2.addEventListener('click', function() {
        fEditType2Container.style.display = "block";
        fEditType1Container.style.display = "none";
        chrome.storage.local.set({fontType: "2"});
        getFavicon();
    });

    /* End of Favicon Type Nav */

    /* Var value set */
    var fEditTextColorValue;
    var fEditBgColorValue;
    var fEditSizeValue;
    var fEditTextValue;
    var fEditGoogleFontValue;
    var googleFontsMarkup;
    var fEditFontAwesomeValue;
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



    // Unused code to change page - remove if sure not used
    /*var resultsPage = document.getElementById("main_nav2");
    resultsPage.addEventListener("click", changePageResults);
    function changePageResults(){
        var faviconDiv = document.getElementById("favicon_display_container").innerHTML;
        faviconDiv = encodeURIComponent(faviconDiv);
        window.location.href = "result.html?favicon="+faviconDiv;
    }*/





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



    /* Font Awesome */

    var fontAwesomeButton = document.getElementById("favicon_edit_font_awesome_button");
    var fontAwesomeContainer = document.getElementById("favicon_edit_font_awesome");

    fontAwesomeButton.addEventListener("click", function(){
        fontAwesomeContainer.classList.toggle("favicon_edit_font_awesome_active");
    });

    fontAwesomeContainer.addEventListener("click",function(e) {
        var fontAwesomeChange = false;
        if (e.target && e.target.matches("li")) {
            var fontAwesomeSpan = e.target.querySelector("span");
            fEditFontAwesomeValue = fontAwesomeSpan.innerText;
            selectFontAwesomeIcon(fEditFontAwesomeValue);
        }
        if (e.target && e.target.matches("span")) {
            fEditFontAwesomeValue = e.target.innerText;
            selectFontAwesomeIcon(fEditFontAwesomeValue);
        }
        if (e.target && e.target.matches("i")) {
            fEditFontAwesomeValue = e.target.nextElementSibling.innerText;
            selectFontAwesomeIcon(fEditFontAwesomeValue);
        }
    });

    function selectFontAwesomeIcon(el){
        chrome.storage.local.set({fontAwesome: el});
        fontAwesomeContainer.classList.remove("favicon_edit_font_awesome_active");
        fontAwesomeButton.innerHTML = "<i class='fa "+el+"'></i>" + el + " <i class='fa fa-caret-down'></i>";
        getFavicon();
    }


    
    var faviconCreated = false;
    function getFavicon(){

        // Have to declare this here as well? Not sure why? 
        //Is it because its declared and not visible if FontAwesome is displayed first
        fEditText = document.getElementById("favicon_edit_text");

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

        chrome.storage.local.get(['fontType', 'textColor', 'bgColor', 'fontSize', 'text', 'fontFamily', 'fontAwesome'], function(result) {

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
                console.log("Should add text");
                if (result.text != undefined){
                    console.log("Text: " + result.text);
                    fEditTextValue = result.text;
                } else {
                    console.log("Text NOT SET");
                    fEditTextValue = "F";
                }
                fEditText.value = fEditTextValue;
                fDisplay2.innerHTML = fEditTextValue;
            }

            function addIcon(){
                // Font Awesome
                fEditType1Container.style.display = "none";
                    fEditType2Container.style.display = "block";
                    fEditType2.checked = true;

                if (result.fontAwesome != undefined){
                    console.log("Font Awesome: " + result.fontAwesome);
                    fEditText = '<i class="fa '+result.fontAwesome+'"></i>';
                    fEditText2 = result.fontAwesome;
                } else {
                    console.log("Font Awesome NOT SET");
                    fEditText = '<i class="fa fa-thumbs-up"></i>';
                    fEditText2 = "fa-thumbs-up";
                }
                fontAwesomeButton.innerHTML = fEditText + fEditText2 + " <i class='fa fa-caret-down'></i>";
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
            fEditGoogleFont.value = fEditGoogleFontValue;
            fDisplay2.style.fontFamily = fEditGoogleFontValue;
            document.getElementById("googleFontStylesheet").setAttribute('href', 'https://fonts.googleapis.com/css?family='+fEditGoogleFontValue);

        });

    }

});

