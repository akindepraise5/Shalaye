// ===== DOM Elements =====
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const summarizeBtn = document.getElementById('summarizeBtn');
const complexitySlider = document.getElementById('complexitySlider');
const complexityValue = document.getElementById('complexityValue');
const pageTitle = document.getElementById('pageTitle');
const readingTimeEl = document.getElementById('readingTime');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const summaryResult = document.getElementById('summaryResult');
const summaryText = document.getElementById('summaryText');
const keyPoints = document.getElementById('keyPoints');
const copyBtn = document.getElementById('copyBtn');
const saveBtn = document.getElementById('saveBtn');
const speakBtn = document.getElementById('speakBtn');
const savedList = document.getElementById('savedList');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const settingsBtn = document.getElementById('settingsBtn');
const themeToggle = document.getElementById('themeToggle');

// ===== State =====
let currentSummary = null;
let currentUrl = '';
let currentPageTitle = '';
let isSpeaking = false;

// ===== Complexity Levels =====
const complexityLevels = { 1: 'Quick', 2: 'Standard', 3: 'Detailed' };

// ===== Theme Toggle =====
async function initTheme() {
  const { theme = 'light' } = await chrome.storage.local.get('theme');
  document.documentElement.setAttribute('data-theme', theme);
}

themeToggle.addEventListener('click', async () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  await chrome.storage.local.set({ theme: next });
  showToast(next === 'dark' ? '🌙 Dark mode' : '☀️ Light mode');
});

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
  await initTheme();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentUrl = tab.url;
      currentPageTitle = tab.title || 'Untitled Page';
      pageTitle.textContent = currentPageTitle;

      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContent' });
        if (response?.readingTime) {
          readingTimeEl.textContent = `${response.readingTime} min read`;
        }
      } catch (e) { /* Content script not ready */ }
    }
  } catch (err) {
    pageTitle.textContent = 'Unable to load page';
  }

  loadSavedItems();
});

// ===== Tab Switching =====
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`${targetTab}-tab`).classList.add('active');
    if (targetTab === 'saved') loadSavedItems();
  });
});

// ===== Complexity Slider =====
complexitySlider.addEventListener('input', (e) => {
  complexityValue.textContent = complexityLevels[parseInt(e.target.value)];
});

// ===== Summarize =====
summarizeBtn.addEventListener('click', summarizePage);
retryBtn.addEventListener('click', summarizePage);

async function summarizePage() {
  const level = parseInt(complexitySlider.value);
  hideAllResults();
  loading.classList.remove('hidden');
  summarizeBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) throw new Error('Cannot access this page');
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      throw new Error('Cannot summarize browser pages');
    }

    let content = null, readingTime = null;

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContent' });
      if (response?.content) {
        content = response.content;
        readingTime = response.readingTime;
      }
    } catch (e) {
      // Inject content script
      await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content/content.css'] });
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] });
      await new Promise(r => setTimeout(r, 100));

      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContent' });
      if (response?.content) {
        content = response.content;
        readingTime = response.readingTime;
      }
    }

    if (!content) throw new Error('Could not extract content');
    if (readingTime) readingTimeEl.textContent = `${readingTime} min read`;

    const result = await chrome.runtime.sendMessage({
      action: 'summarize',
      content, level,
      url: currentUrl,
      title: currentPageTitle
    });

    if (result.error) throw new Error(result.error);
    currentSummary = result;
    displaySummary(result);

  } catch (err) {
    showError(err.message);
  } finally {
    summarizeBtn.disabled = false;
  }
}

function displaySummary(result) {
  hideAllResults();
  summaryText.textContent = result.summary;
  keyPoints.innerHTML = '';
  (result.keyPoints || []).forEach(point => {
    const li = document.createElement('li');
    li.textContent = point;
    keyPoints.appendChild(li);
  });
  summaryResult.classList.remove('hidden');
  saveBtn.classList.remove('saved');
}

function showError(message) {
  hideAllResults();
  errorMessage.textContent = message;
  error.classList.remove('hidden');
}

function hideAllResults() {
  loading.classList.add('hidden');
  error.classList.add('hidden');
  summaryResult.classList.add('hidden');
}

// ===== Copy =====
copyBtn.addEventListener('click', async () => {
  if (!currentSummary) return;
  const text = `# ${currentPageTitle}\n\n${currentSummary.summary}\n\n## Key Takeaways\n${(currentSummary.keyPoints || []).map(p => `• ${p}`).join('\n')}\n\nSource: ${currentUrl}`;
  await navigator.clipboard.writeText(text);
  showToast('Copied to clipboard');
});

// ===== Text-to-Speech =====
speakBtn.addEventListener('click', () => {
  if (!currentSummary) return;

  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    speakBtn.classList.remove('speaking');
    return;
  }

  const text = currentSummary.summary + '. Key takeaways: ' + (currentSummary.keyPoints || []).join('. ');
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.onend = () => { isSpeaking = false; speakBtn.classList.remove('speaking'); };
  speechSynthesis.speak(utterance);
  isSpeaking = true;
  speakBtn.classList.add('speaking');
});

// ===== Save =====
saveBtn.addEventListener('click', async () => {
  if (!currentSummary) return;

  const item = {
    id: Date.now().toString(),
    url: currentUrl,
    title: currentPageTitle,
    summary: currentSummary.summary,
    keyPoints: currentSummary.keyPoints,
    timestamp: new Date().toISOString()
  };

  const { savedSummaries = [] } = await chrome.storage.local.get('savedSummaries');
  savedSummaries.unshift(item);
  if (savedSummaries.length > 50) savedSummaries.pop();
  await chrome.storage.local.set({ savedSummaries });

  saveBtn.classList.add('saved');
  showToast('Saved');
});

// ===== Load Saved =====
async function loadSavedItems() {
  const { savedSummaries = [] } = await chrome.storage.local.get('savedSummaries');

  if (savedSummaries.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  savedList.querySelectorAll('.saved-item').forEach(el => el.remove());

  savedSummaries.forEach(item => {
    const div = document.createElement('div');
    div.className = 'saved-item';
    div.innerHTML = `
      <div class="saved-item-header">
        <span class="saved-item-title">${escapeHtml(item.title)}</span>
        <button class="saved-item-delete" data-id="${item.id}">Delete</button>
      </div>
      <div class="saved-item-date">${formatDate(item.timestamp)}</div>
      <div class="saved-item-preview">${escapeHtml(item.summary.substring(0, 100))}...</div>
    `;

    div.addEventListener('click', (e) => {
      if (!e.target.classList.contains('saved-item-delete')) {
        currentSummary = { summary: item.summary, keyPoints: item.keyPoints };
        currentUrl = item.url;
        currentPageTitle = item.title;
        pageTitle.textContent = item.title;
        tabs[0].click();
        displaySummary(currentSummary);
        saveBtn.classList.add('saved');
      }
    });

    div.querySelector('.saved-item-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      const { savedSummaries = [] } = await chrome.storage.local.get('savedSummaries');
      await chrome.storage.local.set({ savedSummaries: savedSummaries.filter(s => s.id !== item.id) });
      loadSavedItems();
      showToast('Deleted');
    });

    savedList.appendChild(div);
  });
}

// ===== Settings =====
settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

// ===== Toast =====
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 200);
  }, 2000);
}

// ===== Utilities =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(iso) {
  const diff = Date.now() - new Date(iso);
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(iso).toLocaleDateString();
}
