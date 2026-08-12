document.addEventListener('partialsLoaded', function() {

    var fEditTheme = document.getElementById("theme_toggle");
    var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    var currentTheme = "light";

    chrome.storage.local.get(["theme"], function(result) {
        if (result.theme !== undefined) {
            currentTheme = result.theme;
        }
        applyTheme(currentTheme);
    });

    fEditTheme.addEventListener("click", function() {
        var next = { light: "dark", dark: "system", system: "light" };
        currentTheme = next[currentTheme] || "light";
        chrome.storage.local.set({ theme: currentTheme });
        applyTheme(currentTheme);
    });

    function onSystemThemeChange() {
        if (currentTheme === "system") {
            applyResolvedTheme(mediaQuery.matches ? "dark" : "light");
        }
    }

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", onSystemThemeChange);
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener(onSystemThemeChange);
    }

    function applyTheme(theme) {
        currentTheme = theme;
        updateThemeIcon(theme);

        if (theme === "system") {
            applyResolvedTheme(mediaQuery.matches ? "dark" : "light");
        } else {
            applyResolvedTheme(theme);
        }
    }

    function updateThemeIcon(theme) {
        fEditTheme.className = "fa";
        if (theme === "dark") {
            fEditTheme.classList.add("fa-moon-o");
            fEditTheme.title = "Theme: Dark (click for System)";
        } else if (theme === "system") {
            fEditTheme.classList.add("fa-desktop");
            fEditTheme.title = "Theme: System (click for Light)";
        } else {
            fEditTheme.classList.add("fa-sun-o");
            fEditTheme.title = "Theme: Light (click for Dark)";
        }
    }

    function applyResolvedTheme(resolved) {
        var existing = document.getElementById("theme_style");
        if (existing) {
            existing.remove();
        }

        if (resolved !== "dark") {
            return;
        }

        var css = `
            html,
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

        var head = document.head || document.getElementsByTagName("head")[0];
        var style = document.createElement("style");

        style.type = "text/css";
        style.id = "theme_style";
        style.appendChild(document.createTextNode(css));

        head.appendChild(style);
    }

});
