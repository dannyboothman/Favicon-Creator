function partialUrl(path) {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL(path);
    }
    return path;
}

async function loadPartial(path, targetId) {
    const res = await fetch(partialUrl(path));
    if (!res.ok) {
        throw new Error("Failed to load " + path);
    }
    const html = await res.text();
    document.getElementById(targetId).innerHTML = html;
}

function setActiveNavLink() {
    const page = location.pathname.split("/").pop() || "popup.html";
    const links = document.querySelectorAll("#main_nav a[href]");
    links.forEach(function (link) {
        const href = link.getAttribute("href");
        if (href === page) {
            link.classList.add("main_nav_active");
            link.removeAttribute("href");
        }
    });
}

async function loadLayout() {
    await Promise.all([
        loadPartial("partials/header.html", "header-slot"),
        loadPartial("partials/nav.html", "nav-slot"),
    ]);
    setActiveNavLink();
    document.dispatchEvent(new Event("partialsLoaded"));
}

document.addEventListener("DOMContentLoaded", loadLayout);
