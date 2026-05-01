// ===== Shalaye Service Worker =====
// Dual API: Gemini (primary) + Groq (fallback)

// ===== API Configuration =====
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const PROXY_API_URL = 'https://shalaye-api-proxy.akindepraise5.workers.dev/';

// ===== Retrieve API Keys from Storage =====
async function getAPIKeys() {
    return await chrome.storage.sync.get({
        geminiKey: '',
        groqKey: ''
    });
}

// ===== Context Menu Setup =====
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'shalaye-explain',
        title: 'Shalaye: Explain this',
        contexts: ['selection']
    });
    console.log('Shalaye extension installed');
});

// ===== Context Menu Click Handler =====
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'shalaye-explain' && info.selectionText) {
        try {
            const [{ result: selectionInfo }] = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.shalayeSelectionInfo
            });

            const explanation = await explainText(info.selectionText);

            await chrome.tabs.sendMessage(tab.id, {
                action: 'explainText',
                explanation,
                position: selectionInfo?.position || { x: 100, y: 100 }
            });
        } catch (error) {
            console.error('Explain error:', error);
            await chrome.tabs.sendMessage(tab.id, {
                action: 'explainText',
                error: error.message,
                position: { x: 100, y: 100 }
            }).catch(() => {});
        }
    }
});

// ===== Message Listener =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'summarize') {
        handleSummarize(request)
            .then(sendResponse)
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }

    if (request.action === 'explainSelection') {
        explainText(request.text)
            .then(explanation => sendResponse({ explanation }))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
});

// ===== Handle Summarize Request =====
async function handleSummarize({ content, level, url, title }) {
    if (!content || content.length < 50) {
        throw new Error('Not enough content to summarize');
    }

    const prompt = buildSummarizePrompt(content, level, title);

    // Try Groq first, fallback to Gemini
    let response;
    try {
        console.log('Trying Groq API...');
        response = await callGroqAPI(prompt);
    } catch (groqError) {
        console.log('Groq failed, trying Gemini...', groqError.message);
        try {
            response = await callGeminiAPI(prompt);
        } catch (geminiError) {
            throw new Error(`APIs failed. Groq: ${groqError.message}. Gemini: ${geminiError.message}`);
        }
    }

    return parseSummaryResponse(response);
}

// ===== Build Summarize Prompt =====
function buildSummarizePrompt(content, level, title) {
    const levelInstructions = {
        1: `Provide a QUICK summary in 2-3 sentences. Extract only the 3 most important key points.`,
        2: `Provide a STANDARD summary in 4-6 sentences. Extract 4-5 key takeaways.`,
        3: `Provide a DETAILED breakdown with a comprehensive summary. Extract 6-8 key points.`
    };

    return `You are Shalaye, a helpful assistant that simplifies web content.

Summarize and extract key points from this content.

Title: ${title}

${levelInstructions[level] || levelInstructions[2]}

Use simple, clear language. Be direct and to the point.

Respond in this exact JSON format:
{
  "summary": "Your summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"]
}

CONTENT:
${content.substring(0, 12000)}

Respond ONLY with the JSON object.`;
}

// ===== Explain Text =====
async function explainText(text) {
    const prompt = `Explain this text in simple terms (2-4 sentences):
"${text}"

Use everyday language. Be friendly and brief.`;

    try {
        return await callGroqAPI(prompt, true);
    } catch (groqError) {
        try {
            return await callGeminiAPI(prompt, true);
        } catch (geminiError) {
            throw new Error(`APIs failed. Groq: ${groqError.message}. Gemini: ${geminiError.message}`);
        }
    }
}

// ===== Call Proxy API =====
async function callProxyAPI(prompt, model, rawText = false) {
    const response = await fetch(PROXY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Proxy error ${response.status}`);
    }

    const data = await response.json();
    
    let text = '';
    if (model === 'gemini') {
        text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (model === 'groq') {
        text = data.choices?.[0]?.message?.content;
    }

    if (!text) throw new Error(`No response from Proxy (${model})`);
    return rawText ? text.trim() : text;
}

// ===== Call Gemini API =====
async function callGeminiAPI(prompt, rawText = false) {
    const { geminiKey } = await getAPIKeys();
    
    if (!geminiKey) {
        return await callProxyAPI(prompt, 'gemini', rawText);
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini error ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error('No response from Gemini');
    return rawText ? text.trim() : text;
}

// ===== Call Groq API =====
async function callGroqAPI(prompt, rawText = false) {
    const { groqKey } = await getAPIKeys();
    
    if (!groqKey) {
        return await callProxyAPI(prompt, 'groq', rawText);
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Groq error ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) throw new Error('No response from Groq');
    return rawText ? text.trim() : text;
}

// ===== Parse Summary Response =====
function parseSummaryResponse(responseText) {
    try {
        let jsonStr = responseText;

        // Extract JSON from markdown code blocks if present
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) jsonStr = jsonMatch[1];

        // Find JSON object
        const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (objectMatch) jsonStr = objectMatch[0];

        const parsed = JSON.parse(jsonStr);
        return {
            summary: parsed.summary || 'No summary generated',
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : []
        };
    } catch (error) {
        return { summary: responseText.substring(0, 500), keyPoints: [] };
    }
}
