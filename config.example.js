// ===== API Keys Configuration =====
// Copy this file and rename to config.js
// Add your actual API keys below
// DO NOT COMMIT THIS FILE TO GIT

const CONFIG = {
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
    GROQ_API_KEY: 'YOUR_GROQ_API_KEY_HERE'
};

// Export for use in service worker
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
