// ==UserScript==
// @name         GitHub Remove Agents Nav Item
// @author       wxn0brP
// @namespace    http://tampermonkey.net/
// @version      2026-02-14
// @description  Removes parent of nav link containing "agents" in href on all GitHub repo subpages
// @match        https://github.com/*/*
// @match        https://github.com/*/*/*
// @match        https://github.com/*/*/*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {
    "use strict";

    const removeAgentsNav = () => {
        const navLinks = document.querySelectorAll("nav a");

        for (const link of navLinks) {
            const href = link.getAttribute("href");

            if (href?.includes("agents")) {
                link.parentElement?.remove();
                break;
            }
        }
    };

    removeAgentsNav();

    const observer = new MutationObserver(() => {
        removeAgentsNav();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
