// ==UserScript==
// @name         Qwen.ai Copy Fix
// @namespace    http://tampermonkey.net/
// @version      2026-02-23
// @description  Fixes Ctrl+C copying JSON instead of text on qwen.ai
// @author       wxn0brP + Qwen
// @match        https://qwen.ai/*
// @match        https://*.qwen.ai/*
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        debug: false,
        forceFix: true
    };

    const log = (...args) => CONFIG.debug && console.log('[QwenCopyFix]', ...args);

    function fixCopyEvent(e) {
        const selection = window.getSelection();
        const selectedText = selection?.toString()?.trim();

        if (!selectedText) {
            log('No selection, skipping...');
            return;
        }

        if (selectedText.startsWith('{"version"')) {
            log('Detected JSON, but it is selected text - not blocking');
            return;
        }

        log('Intercepted copy:', selectedText.substring(0, 50) + '...');

        e.stopImmediatePropagation();
        e.preventDefault();

        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(selectedText).then(() => {
                log('Copied via Clipboard API');
            }).catch(err => {
                log('Clipboard API error:', err);
                fallbackCopy(selectedText);
            });
        } else {
            fallbackCopy(selectedText);
        }
    }

    function fallbackCopy(text) {
        try {
            if (typeof GM_setClipboard === 'function') {
                GM_setClipboard(text);
                log('Copied via GM_setClipboard');
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                textarea.style.top = '-9999px';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                log('Copied via execCommand');
            }
        } catch (err) {
            console.error('[QwenCopyFix] Copy error:', err);
        }
    }

    function init() {
        document.addEventListener('copy', fixCopyEvent, { capture: true, passive: false });
        log('✅ Loaded QwenCopyFix');

        if (typeof GM_registerMenuCommand === 'function') {
            GM_registerMenuCommand(
                `🐛 Debug: ${CONFIG.debug ? 'ON' : 'OFF'}`,
                () => {
                    CONFIG.debug = !CONFIG.debug;
                    alert(`Debug mode: ${CONFIG.debug ? 'ON' : 'OFF'}`);
                }
            );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
