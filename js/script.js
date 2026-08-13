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
            fEditTheme.setAttribute("aria-label", "Theme: Dark (click for System)");
        } else if (theme === "system") {
            fEditTheme.classList.add("fa-desktop");
            fEditTheme.setAttribute("aria-label", "Theme: System (click for Light)");
        } else {
            fEditTheme.classList.add("fa-sun-o");
            fEditTheme.setAttribute("aria-label", "Theme: Light (click for Dark)");
        }
    }

    function applyResolvedTheme(resolved) {
        document.documentElement.setAttribute("data-theme", resolved);
    }

});
