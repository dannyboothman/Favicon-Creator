document.addEventListener('DOMContentLoaded', function() {

    chrome.storage.local.get(['theme'], function(result) {
        if (result.theme != undefined){
            console.log("theme: " + result.theme);
            if (result.theme == "dark"){
                addDarkTheme();
            }
        }
    });

    /* Theme */
    var fEditTheme = document.getElementById("theme_toggle");
    
    fEditTheme.addEventListener('click', function() {

        var themeSelected = fEditTheme.getAttribute("class");
        if (themeSelected == "fa fa-moon-o"){
            chrome.storage.local.set({theme: "dark"});
            addDarkTheme();
        } else {
            chrome.storage.local.set({theme: "light"});
            fEditTheme.classList.add("fa-moon-o");
            fEditTheme.classList.remove("fa-sun-o");
            document.getElementById("theme_style").remove();
        }

    });


    function addDarkTheme(){
        fEditTheme.classList.remove("fa-moon-o");
        fEditTheme.classList.add("fa-sun-o");

        var css = `
            body{ 
                background-color: #232323;
                color: #FFF;
            }
            :root{ 
                --main-color: #FE145B;
                --main-color-hover: #bb1245;
                --body-color: #fff;
                
                --main-border: #000000;
                --light-color: #090A0B;
                --light-color2: #FFF;
                --nav-bg: #090A0B;
                --nav-color: #FFF;
            }
        `;

        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

        style.type = 'text/css';
        style.id = 'theme_style'
        style.appendChild(document.createTextNode(css));

        head.appendChild(style);
    }

});