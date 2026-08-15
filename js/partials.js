function partialUrl(path) {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL(path);
    }
    return path;
}

var partialTextCache = {};

async function getPartialText(path) {
    if (!partialTextCache[path]) {
        partialTextCache[path] = fetch(partialUrl(path)).then(function (res) {
            if (!res.ok) {
                throw new Error("Failed to load " + path);
            }
            return res.text();
        });
    }
    return partialTextCache[path];
}

function applyPartialVars(html, vars) {
    if (!vars) {
        return html;
    }
    Object.keys(vars).forEach(function (name) {
        html = html.split("{{" + name + "}}").join(vars[name]);
    });
    return html;
}

async function loadPartial(path, targetId, vars) {
    var target = document.getElementById(targetId);
    if (!target) {
        return;
    }
    var html = await getPartialText(path);
    target.innerHTML = applyPartialVars(html, vars);
}

async function loadDataPartials() {
    var slots = document.querySelectorAll("[data-partial]");
    return Promise.all(
        Array.prototype.map.call(slots, function (slot) {
            var path = slot.getAttribute("data-partial");
            var prefix = slot.getAttribute("data-partial-prefix");
            return getPartialText(path).then(function (html) {
                slot.innerHTML = applyPartialVars(
                    html,
                    prefix ? { PREFIX: prefix } : null
                );
            });
        })
    );
}

function setActiveNavLink() {
    const page = location.pathname.split("/").pop() || "popup.html";
    // Privacy lives under Settings; keep Settings highlighted there.
    const activePage = page === "privacy.html" ? "settings.html" : page;
    const links = document.querySelectorAll("#main_nav a[href]");
    links.forEach(function (link) {
        const href = link.getAttribute("href");
        if (href === activePage) {
            link.classList.add("main_nav_active");
            link.removeAttribute("href");
        }
    });
}

async function loadLayout() {
    await Promise.all([
        loadPartial("partials/header.html", "header-slot"),
        loadPartial("partials/nav.html", "nav-slot"),
        loadDataPartials(),
    ]);
    setActiveNavLink();
    document.dispatchEvent(new Event("partialsLoaded"));
}

document.addEventListener("DOMContentLoaded", loadLayout);
