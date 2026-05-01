// ===== Content Script for Shalaye =====
// Extracts page content and handles text selection

(function () {
    'use strict';

    // ===== Message Listener =====
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'ping') {
            sendResponse({ success: true });
        } else if (request.action === 'getContent') {
            const content = extractPageContent();
            const readingTime = calculateReadingTime(content);
            sendResponse({
                content,
                title: document.title,
                url: window.location.href,
                readingTime
            });
        } else if (request.action === 'explainText') {
            if (request.error) {
                showExplanationTooltip("⚠️ Error: " + request.error, request.position);
            } else {
                showExplanationTooltip(request.explanation, request.position);
            }
            sendResponse({ success: true });
        } else if (request.action === 'highlightKeyPoints') {
            highlightTextOnPage(request.keyPoints);
            sendResponse({ success: true });
        }
        return true;
    });

    // ===== Calculate Reading Time =====
    function calculateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return minutes;
    }

    // ===== Extract Page Content =====
    function extractPageContent() {
        if (isPDF()) {
            return extractPDFContent();
        }

        const mainContent = findMainContent();
        if (mainContent) {
            return cleanText(mainContent.textContent);
        }

        return cleanText(document.body.textContent);
    }

    // ===== Check if PDF =====
    function isPDF() {
        if (window.location.href.toLowerCase().endsWith('.pdf')) return true;
        if (document.contentType?.includes('pdf')) return true;
        if (document.querySelector('#viewer.pdfViewer')) return true;
        return false;
    }

    // ===== Extract PDF Content =====
    function extractPDFContent() {
        const pdfViewer = document.querySelector('#viewer');
        if (pdfViewer) {
            const textLayers = pdfViewer.querySelectorAll('.textLayer');
            let text = '';
            textLayers.forEach(layer => {
                text += layer.textContent + '\n';
            });
            return cleanText(text);
        }
        return 'PDF content extraction requires the document to be viewed in Chrome\'s PDF viewer.';
    }

    // ===== Find Main Content =====
    function findMainContent() {
        const selectors = [
            'article', '[role="main"]', 'main', '.post-content',
            '.article-content', '.entry-content', '.content', '.post',
            '#content', '#main', '.main-content', '.story-body', '.article-body'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 200) {
                return element;
            }
        }

        return findLargestTextBlock();
    }

    // ===== Find Largest Text Block =====
    function findLargestTextBlock() {
        const candidates = document.querySelectorAll('div, section');
        let largest = null;
        let maxLength = 0;

        candidates.forEach(el => {
            const text = el.textContent.trim();
            if (text.length > 500 && text.length < 50000) {
                const className = el.className.toLowerCase();
                const id = (el.id || '').toLowerCase();

                const isNavOrSidebar =
                    className.includes('nav') || className.includes('sidebar') ||
                    className.includes('footer') || className.includes('header') ||
                    className.includes('menu') || id.includes('nav') ||
                    id.includes('sidebar') || id.includes('footer');

                if (!isNavOrSidebar && text.length > maxLength) {
                    maxLength = text.length;
                    largest = el;
                }
            }
        });

        return largest;
    }

    // ===== Clean Text =====
    function cleanText(text) {
        if (!text) return '';

        return text
            .replace(/\s+/g, ' ')
            .replace(/Share on (Twitter|Facebook|LinkedIn|Email)/gi, '')
            .replace(/Subscribe to.*newsletter/gi, '')
            .replace(/Cookie (policy|consent|preferences)/gi, '')
            .replace(/Accept (all )?cookies/gi, '')
            .replace(/Sign up|Log in|Sign in/gi, '')
            .replace(/Advertisement/gi, '')
            .replace(/Sponsored/gi, '')
            .trim()
            .substring(0, 40000);
    }

    // ===== Explanation Tooltip =====
    let tooltipElement = null;

    function showExplanationTooltip(explanation, position) {
        removeTooltip();

        tooltipElement = document.createElement('div');
        tooltipElement.className = 'shalaye-tooltip';
        tooltipElement.innerHTML = `
      <div class="shalaye-tooltip-header">
        <span class="shalaye-tooltip-title">💡 Simplified</span>
        <button class="shalaye-tooltip-close">&times;</button>
      </div>
      <div class="shalaye-tooltip-content">${escapeHtml(explanation)}</div>
      <div class="shalaye-tooltip-actions">
        <button class="shalaye-tooltip-copy">📋 Copy</button>
      </div>
    `;

        // Smart positioning
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let tooltipX = position.x;
        let tooltipY = position.y + 15;

        // Adjust if too close to edges
        if (tooltipX + 350 > viewportWidth + window.scrollX) {
            tooltipX = viewportWidth + window.scrollX - 360;
        }
        if (tooltipX < window.scrollX + 10) {
            tooltipX = window.scrollX + 10;
        }

        tooltipElement.style.left = `${tooltipX}px`;
        tooltipElement.style.top = `${tooltipY}px`;

        document.body.appendChild(tooltipElement);

        // Animate in
        requestAnimationFrame(() => {
            tooltipElement.classList.add('shalaye-tooltip-show');
        });

        // Close button
        tooltipElement.querySelector('.shalaye-tooltip-close').addEventListener('click', removeTooltip);

        // Copy button
        tooltipElement.querySelector('.shalaye-tooltip-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(explanation);
            const btn = tooltipElement.querySelector('.shalaye-tooltip-copy');
            btn.textContent = '✓ Copied!';
            setTimeout(() => btn.textContent = '📋 Copy', 1500);
        });

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    function handleOutsideClick(e) {
        if (tooltipElement && !tooltipElement.contains(e.target)) {
            removeTooltip();
        }
    }

    function removeTooltip() {
        if (tooltipElement) {
            tooltipElement.classList.remove('shalaye-tooltip-show');
            setTimeout(() => {
                if (tooltipElement) {
                    tooltipElement.remove();
                    tooltipElement = null;
                }
            }, 200);
            document.removeEventListener('click', handleOutsideClick);
        }
    }

    // ===== Highlight Key Points on Page =====
    function highlightTextOnPage(keyPoints) {
        // Remove existing highlights
        document.querySelectorAll('.shalaye-highlight').forEach(el => {
            el.outerHTML = el.textContent;
        });

        if (!keyPoints || keyPoints.length === 0) return;

        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        keyPoints.forEach(point => {
            const keywords = point.split(' ').filter(w => w.length > 4).slice(0, 3);
            keywords.forEach(keyword => {
                textNodes.forEach(node => {
                    if (node.textContent.toLowerCase().includes(keyword.toLowerCase())) {
                        const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
                        if (node.parentElement && !node.parentElement.classList.contains('shalaye-highlight')) {
                            const span = document.createElement('span');
                            span.innerHTML = node.textContent.replace(regex, '<mark class="shalaye-highlight">$1</mark>');
                            node.parentElement.replaceChild(span, node);
                        }
                    }
                });
            });
        });
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== Selection Tracking =====
    window.shalayeSelectionInfo = null;

    document.addEventListener('mouseup', (e) => {
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const text = selection.toString().trim();
            if (!text || text.length < 3) {
                window.shalayeSelectionInfo = null;
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            window.shalayeSelectionInfo = {
                text,
                position: {
                    x: rect.left + window.scrollX,
                    y: rect.bottom + window.scrollY
                }
            };
        }, 10);
    });

    // ===== Quick Explain Button on Selection =====
    let quickExplainBtn = null;

    document.addEventListener('mouseup', (e) => {
        setTimeout(() => {
            removeQuickExplainBtn();

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const text = selection.toString().trim();
            if (!text || text.length < 10 || text.length > 5000) return;

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            quickExplainBtn = document.createElement('button');
            quickExplainBtn.className = 'shalaye-quick-explain';
            quickExplainBtn.innerHTML = '💡 Explain';
            quickExplainBtn.style.left = `${rect.left + window.scrollX}px`;
            quickExplainBtn.style.top = `${rect.top + window.scrollY - 35}px`;

            document.body.appendChild(quickExplainBtn);

            requestAnimationFrame(() => {
                quickExplainBtn.classList.add('shalaye-quick-explain-show');
            });

            quickExplainBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                quickExplainBtn.innerHTML = '⏳ Loading...';
                quickExplainBtn.disabled = true;

                try {
                    const response = await chrome.runtime.sendMessage({
                        action: 'explainSelection',
                        text: text
                    });

                    if (response && response.explanation) {
                        showExplanationTooltip(response.explanation, {
                            x: rect.left + window.scrollX,
                            y: rect.bottom + window.scrollY
                        });
                    } else if (response && response.error) {
                        showExplanationTooltip("⚠️ Error: " + response.error, {
                            x: rect.left + window.scrollX,
                            y: rect.bottom + window.scrollY
                        });
                    }
                } catch (err) {
                    console.error('Explain error:', err);
                }

                removeQuickExplainBtn();
            });
        }, 100);
    });

    document.addEventListener('mousedown', (e) => {
        if (quickExplainBtn && !quickExplainBtn.contains(e.target)) {
            removeQuickExplainBtn();
        }
    });

    function removeQuickExplainBtn() {
        if (quickExplainBtn) {
            quickExplainBtn.remove();
            quickExplainBtn = null;
        }
    }

    console.log('Shalaye content script loaded');
})();
