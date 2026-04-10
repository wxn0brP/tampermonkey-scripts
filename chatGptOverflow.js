// ==UserScript==
// @name         GPT un overflow
// @namespace    http://tampermonkey.net/
// @version      2026-04-04
// @description  remove code overflow
// @author       wxn0brP
// @match        https://chatgpt.com/**/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=chatgpt.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    setInterval(() => {
        const arr = [...document.querySelectorAll('[style*="max-height"]')];
        if (arr.length === 0) return;
        arr.forEach(e => e.style.maxHeight = null);
    }, 10000);
})();
