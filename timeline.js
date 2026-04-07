// ==UserScript==
// @name         AI Chat Timeline Navigator
// @version      2026-04-07
// @description  AI Chat Timeline Navigator
// @author       wxn0brP + Qwen
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        colors: {
            base: '#777',
            active: '#00f0ff'
        },
        widths: {
            user: '1.5rem',
            ai: '2rem',
            active: '2.5rem'
        },
        refreshMs: 10_000,
        scrollDebounceMs: 80,
        previewLength: 50,
        scrollOffset: 150
    };

    const map = {
        "chatgpt.com": {
            me: '[data-turn="user"]',
            chat: '[data-turn^="assistant"]',
            main: '[data-scroll-root]'
        },
        "chat.qwen.ai": {
            me: '.qwen-chat-message-user',
            chat: '.qwen-chat-message-assistant',
            main: '.chat-messages'
        },
        "chat.mistral.ai": {
            me: '[data-message-author-role="user"]',
            chat: '[data-message-author-role="assistant"]',
            main: '.items-end [data-radix-scroll-area-viewport]'
        }
    };

    let currentConfig = null;
    let timelineContainer = null;
    let messageMap = []; // [{ tick, msg, isAI, baseWidth }]

    function getConfig() {
        const hostname = window.location.hostname;
        for (const key in map) {
            if (hostname.includes(key)) return map[key];
        }
    }

    function createTimeline() {
        if (timelineContainer) return;
        timelineContainer = document.createElement('div');
        timelineContainer.id = 'ai-timeline-nav';
        Object.assign(timelineContainer.style, {
            position: 'fixed',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: '999999',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            pointerEvents: 'auto',
            userSelect: 'none',
            padding: '10px 0'
        });
        document.body.appendChild(timelineContainer);
    }

    const interleave = (a, b) =>
        a.flatMap((x, i) => [x, b[i]]).filter(x => x !== undefined)

    function updateTimeline() {
        if (!currentConfig || !timelineContainer) return;

        timelineContainer.innerHTML = '';
        messageMap = [];

        const userMsgs = Array.from(document.querySelectorAll(currentConfig.me));
        const aiMsgs = Array.from(document.querySelectorAll(currentConfig.chat));
        const main = document.querySelector(currentConfig.main);

        const allMessages = interleave(userMsgs, aiMsgs);

        allMessages.forEach((msg, index) => {
            const isAI = aiMsgs.includes(msg);
            const baseWidth = isAI ? CONFIG.widths.ai : CONFIG.widths.user;
            const preview = msg.innerText.replace("\n", "").slice(0, CONFIG.previewLength);

            const wrapper = document.createElement('div');
            Object.assign(wrapper.style, {
                cursor: 'pointer',
                padding: '5px 0'
            });

            const tick = document.createElement('div');
            tick.className = isAI ? 'tick-ai' : 'tick-user';
            tick.dataset.index = index;
            tick.title = preview;

            Object.assign(tick.style, {
                height: '5px',
                width: baseWidth,
                backgroundColor: CONFIG.colors.base,
                borderRadius: '3px',
                marginLeft: 'auto',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
            });

            wrapper.appendChild(tick);

            wrapper.addEventListener('click', (e) => {
                e.stopImmediatePropagation();
                const targetTop = msg.offsetTop + msg.offsetHeight - CONFIG.scrollOffset;
                main.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            });

            timelineContainer.appendChild(wrapper);
            messageMap.push({ tick, msg, isAI, baseWidth });
        });
    }

    function markCurrent() {
        if (!timelineContainer || messageMap.length === 0) return;
        const main = document.querySelector(currentConfig.main);
        if (!main) return;

        const ai = messageMap.filter(x => x.isAI);
        let bestMatch = null;

        for (const item of messageMap) {
            item.tick.style.width = item.baseWidth;
            item.tick.style.backgroundColor = CONFIG.colors.base;
        }

        for (const item of ai) {
            if (item.msg.offsetTop + item.msg.offsetHeight > main.scrollTop) {
                bestMatch = item;
                break;
            }
        }

        if (!bestMatch) bestMatch = ai[ai.length - 1];

        bestMatch.tick.style.width = CONFIG.widths.active;
        bestMatch.tick.style.backgroundColor = CONFIG.colors.active;
    }

    function init() {
        currentConfig = getConfig();
        if (!currentConfig) return;

        createTimeline();

        setTimeout(() => {
            updateTimeline();
            markCurrent();
        }, 1000);

        setInterval(() => {
            updateTimeline();
            markCurrent();
        }, CONFIG.refreshMs);

        setInterval(() => {
            markCurrent();
        }, 100);

        console.log('[TIMELINE] inited');
    }

    setTimeout(() => init(), 2_000);
})();
