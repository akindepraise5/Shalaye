// ===== Shalaye V1 — Popup Logic =====

// ===== DOM References =====
const views = document.querySelectorAll('.view');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Onboarding
const getStartedBtn = document.getElementById('getStartedBtn');
const skipBtn = document.getElementById('skipBtn');

// Main
const summarizeBtn = document.getElementById('summarizeBtn');
const savedNavBtn = document.getElementById('savedNavBtn');
const settingsBtn = document.getElementById('settingsBtn');

// Summary
const summaryResultBox = document.getElementById('summaryResultBox');
const summaryText = document.getElementById('summaryText');
const keyPoints = document.getElementById('keyPoints');
const summaryBadgeSelect = document.getElementById('summaryBadgeSelect');
const copyBtn = document.getElementById('copyBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const saveBtn = document.getElementById('saveBtn');
const errorBox = document.getElementById('errorBox');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const savedNavBtn2 = document.getElementById('savedNavBtn2');
const settingsBtn2 = document.getElementById('settingsBtn2');

// Saved
const savedList = document.getElementById('savedList');
const emptyState = document.getElementById('emptyState');
const newSummaryBtn = document.getElementById('newSummaryBtn');
const settingsBtn3 = document.getElementById('settingsBtn3');
const savedTabs = document.querySelectorAll('.saved-tab');

// Speak
const speakBtn = document.getElementById('speakBtn');

// ===== State =====
let currentSummary = null;
let currentUrl = '';
let currentPageTitle = '';
let isSpeaking = false;
let currentLevel = '2';

// ===== View Router =====
function showView(viewId) {
  views.forEach(v => {
    v.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
  // Check if onboarding is done
  const { onboardingComplete, defaultLevel } = await chrome.storage.local.get(['onboardingComplete', 'defaultLevel']);

  if (onboardingComplete) {
    showView('view-main');
  } else {
    showView('view-onboarding');
  }

  // Set default level if available
  if (defaultLevel) {
    const radio = document.querySelector(`input[name="summaryDepth"][value="${defaultLevel}"]`);
    if (radio) radio.checked = true;
  }

  // Load page info
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentUrl = tab.url;
      currentPageTitle = tab.title || 'Untitled Page';
    }
  } catch (e) {
    // Ignore
  }
});

// ===== Onboarding =====
getStartedBtn.addEventListener('click', async () => {
  await chrome.storage.local.set({ onboardingComplete: true });
  showView('view-main');
});

skipBtn.addEventListener('click', async () => {
  await chrome.storage.local.set({ onboardingComplete: true });
  showView('view-main');
});

// ===== Summarize =====
summarizeBtn.addEventListener('click', () => summarizePage());
regenerateBtn.addEventListener('click', () => summarizePage());
retryBtn.addEventListener('click', () => summarizePage());

if (summaryBadgeSelect) {
  summaryBadgeSelect.addEventListener('change', (e) => {
    const newLevel = e.target.value;
    // Sync the radio button on the main view
    const radio = document.querySelector(`input[name="summaryDepth"][value="${newLevel}"]`);
    if (radio) radio.checked = true;
    
    // Trigger the summarization with the new depth
    summarizePage();
  });
}

async function summarizePage() {
  showView('view-loading');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) throw new Error('Cannot access this page');
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      throw new Error('Cannot summarize browser pages');
    }

    currentUrl = tab.url;
    currentPageTitle = tab.title || 'Untitled Page';

    // Get page content
    let content = null;

    try {
      // Check if injected by pinging
      await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
    } catch (e) {
      // Inject content script if not loaded
      await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['content/content.css'] });
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content/content.js'] });
      await new Promise(r => setTimeout(r, 100));
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContent' });
      if (response?.content) {
        content = response.content;
      }
    } catch (e) {
      console.error('Extraction error:', e);
    }

    if (!content) throw new Error('Could not extract content from this page');

    // Call the background service worker
    const selectedLevel = document.querySelector('input[name="summaryDepth"]:checked')?.value || '2';
    currentLevel = selectedLevel;

    const result = await chrome.runtime.sendMessage({
      action: 'summarize',
      content,
      level: parseInt(selectedLevel),
      url: currentUrl,
      title: currentPageTitle
    });

    if (result.error) throw new Error(result.error);

    // Success — show result
    currentSummary = result;
    displaySummary(result);

  } catch (err) {
    showError(err.message);
  }
}

function displaySummary(result) {
  showView('view-summary');

  // Hide error, show result
  errorBox.classList.add('hidden');
  summaryResultBox.classList.remove('hidden');

  // Update badge dropdown based on current level
  if (summaryBadgeSelect) {
    summaryBadgeSelect.value = currentLevel;
  }

  // Render summary text
  summaryText.textContent = result.summary || 'No summary generated';

  // Render key points
  keyPoints.innerHTML = '';
  (result.keyPoints || []).forEach(point => {
    const li = document.createElement('li');
    li.textContent = point;
    keyPoints.appendChild(li);
  });

  // Reset save button state
  saveBtn.classList.remove('saved-chip');
  saveBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.1469 3.92636C16.045 1.16256 19.955 1.16257 20.8531 3.92636L23.1314 10.9372L30.5032 10.9375C33.4092 10.9376 34.6175 14.6563 32.2665 16.3645L26.3028 20.6977L28.5805 27.7087C29.4784 30.4726 26.3151 32.7709 23.964 31.0628L18 26.73L12.036 31.0628C9.68486 32.7709 6.52159 30.4726 7.41951 27.7087L9.69723 20.6977L3.73353 16.3645C1.38254 14.6563 2.59081 10.9376 5.49686 10.9375L12.8686 10.9372L15.1469 3.92636ZM18 4.85351L15.7217 11.8644C15.3201 13.1004 14.1683 13.9372 12.8687 13.9372L5.49698 13.9375L11.4607 18.2707C12.512 19.0347 12.952 20.3887 12.5504 21.6247L10.2727 28.6357L16.2367 24.3029C17.2882 23.5391 18.7118 23.5391 19.7633 24.3029L25.7273 28.6357L23.4496 21.6247C23.048 20.3887 23.488 19.0347 24.5393 18.2707L30.503 13.9375L23.1313 13.9372C21.8317 13.9372 20.6799 13.1003 20.2783 11.8644L18 4.85351Z" fill="currentColor"/>
</svg>
    Save
  `;
}

function showError(message) {
  showView('view-summary');

  // Show error, hide result
  summaryResultBox.classList.add('hidden');
  errorBox.classList.remove('hidden');
  errorMessage.textContent = message;
}

// ===== Copy =====
copyBtn.addEventListener('click', async () => {
  if (!currentSummary) return;

  const text = `${currentPageTitle}\n\n${currentSummary.summary}\n\nKey Takeaways:\n${(currentSummary.keyPoints || []).map(p => `• ${p}`).join('\n')}\n\nSource: ${currentUrl}`;

  await navigator.clipboard.writeText(text);

  // Visual feedback
  copyBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Copied!
  `;
  showToast('Copied to clipboard');

  setTimeout(() => {
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 6C14.1716 6 13.5 6.67157 13.5 7.5V22.5C13.5 23.3284 14.1716 24 15 24H27C27.8284 24 28.5 23.3284 28.5 22.5V12.6213L21.8787 6H15ZM10.5 7.5C10.5 5.01472 12.5147 3 15 3H21.8787C22.6743 3 23.4374 3.31607 24 3.87868L30.6213 10.5C31.1839 11.0626 31.5 11.8257 31.5 12.6213V22.5C31.5 24.9853 29.4853 27 27 27H25.5V28.5C25.5 30.9853 23.4853 33 21 33H9C6.51472 33 4.5 30.9853 4.5 28.5V13.5C4.5 11.0147 6.51472 9 9 9H10.5V7.5ZM10.5 12H9C8.17157 12 7.5 12.6716 7.5 13.5V28.5C7.5 29.3284 8.17157 30 9 30H21C21.8284 30 22.5 29.3284 22.5 28.5V27H15C12.5147 27 10.5 24.9853 10.5 22.5V12Z" fill="currentColor"/>
</svg>
      Copy
    `;
  }, 2000);
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

  // Visual feedback
  saveBtn.classList.add('saved-chip');
  saveBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Saved!
  `;
  showToast('Summary saved');
});

// ===== Navigate to Saved =====
savedNavBtn.addEventListener('click', () => {
  showView('view-saved');
  loadSavedItems();
});

savedNavBtn2.addEventListener('click', () => {
  showView('view-saved');
  loadSavedItems();
});

// ===== Navigate back to Main =====
newSummaryBtn.addEventListener('click', () => {
  showView('view-main');
});

// ===== Saved Tabs =====
savedTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    savedTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    // Both tabs show same data for V1
    loadSavedItems();
  });
});

// ===== Load Saved Items =====
async function loadSavedItems() {
  const { savedSummaries = [] } = await chrome.storage.local.get('savedSummaries');

  // Clear existing items (keep empty state element)
  savedList.querySelectorAll('.saved-item').forEach(el => el.remove());

  if (savedSummaries.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  savedSummaries.forEach(item => {
    const div = document.createElement('div');
    div.className = 'saved-item';

    const domain = extractDomain(item.url);

    div.innerHTML = `
      <div class="saved-item-icon">
        <svg width="16" height="16" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.625 19.5C23.625 19.2016 23.5065 18.9155 23.2955 18.7045C23.0845 18.4935 22.7984 18.375 22.5 18.375H13.5C13.2016 18.375 12.9155 18.4935 12.7045 18.7045C12.4935 18.9155 12.375 19.2016 12.375 19.5C12.375 19.7984 12.4935 20.0845 12.7045 20.2955C12.9155 20.5065 13.2016 20.625 13.5 20.625H22.5C22.7984 20.625 23.0845 20.5065 23.2955 20.2955C23.5065 20.0845 23.625 19.7984 23.625 19.5ZM23.625 25.5C23.625 25.2016 23.5065 24.9155 23.2955 24.7045C23.0845 24.4935 22.7984 24.375 22.5 24.375H13.5C13.2016 24.375 12.9155 24.4935 12.7045 24.7045C12.4935 24.9155 12.375 25.2016 12.375 25.5C12.375 25.7984 12.4935 26.0845 12.7045 26.2955C12.9155 26.5065 13.2016 26.625 13.5 26.625H22.5C22.7984 26.625 23.0845 26.5065 23.2955 26.2955C23.5065 26.0845 23.625 25.7984 23.625 25.5Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 3.375C9.40598 3.375 8.35677 3.8096 7.58318 4.58318C6.8096 5.35677 6.375 6.40598 6.375 7.5V28.5C6.375 29.594 6.8096 30.6432 7.58318 31.4168C8.35677 32.1904 9.40598 32.625 10.5 32.625H25.5C26.594 32.625 27.6432 32.1904 28.4168 31.4168C29.1904 30.6432 29.625 29.594 29.625 28.5V11.952C29.625 11.3805 29.439 10.8255 29.094 10.3695L24.597 4.4175C24.3523 4.09367 24.0359 3.831 23.6725 3.65011C23.3092 3.46923 22.9089 3.37505 22.503 3.375H10.5ZM8.625 7.5C8.625 6.465 9.465 5.625 10.5 5.625H21.375V12.2205C21.375 12.8415 21.879 13.3455 22.5 13.3455H27.375V28.5C27.375 29.535 26.535 30.375 25.5 30.375H10.5C9.465 30.375 8.625 29.535 8.625 28.5V7.5Z" fill="currentColor"/>
</svg>
      </div>
      <div class="saved-item-info">
        <div class="saved-item-title">${escapeHtml(item.title)}</div>
        <div class="saved-item-meta">${escapeHtml(domain)} · ${formatDate(item.timestamp)}</div>
      </div>
      <button class="saved-item-delete" data-id="${item.id}" title="Delete">×</button>
    `;

    // Click to view summary
    div.addEventListener('click', (e) => {
      if (e.target.classList.contains('saved-item-delete')) return;
      currentSummary = { summary: item.summary, keyPoints: item.keyPoints };
      currentUrl = item.url;
      currentPageTitle = item.title;
      displaySummary(currentSummary);
    });

    // Delete button
    div.querySelector('.saved-item-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      const { savedSummaries = [] } = await chrome.storage.local.get('savedSummaries');
      await chrome.storage.local.set({
        savedSummaries: savedSummaries.filter(s => s.id !== item.id)
      });
      showToast('Deleted');
      loadSavedItems();
    });

    savedList.appendChild(div);
  });
}

// ===== Text-to-Speech =====
const speakDefaultIcon = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
`;

const speakStopIcon = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
`;

speakBtn.addEventListener('click', () => {
  if (!currentSummary) return;

  if (isSpeaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    speakBtn.classList.remove('active-nav');
    speakBtn.innerHTML = speakDefaultIcon;
    return;
  }

  const text = currentSummary.summary + '. Key takeaways: ' + (currentSummary.keyPoints || []).join('. ');
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;

  utterance.onend = () => {
    isSpeaking = false;
    speakBtn.classList.remove('active-nav');
    speakBtn.innerHTML = speakDefaultIcon;
  };

  speechSynthesis.speak(utterance);
  isSpeaking = true;
  speakBtn.classList.add('active-nav');
  speakBtn.innerHTML = speakStopIcon;
});

// ===== Settings =====
settingsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
settingsBtn2.addEventListener('click', () => chrome.runtime.openOptionsPage());
settingsBtn3.addEventListener('click', () => chrome.runtime.openOptionsPage());

// ===== Logo Click to Home =====
document.querySelectorAll('.header-logo').forEach(logo => {
  logo.style.cursor = 'pointer';
  logo.title = 'Go to Home';
  logo.addEventListener('click', async () => {
    const { onboardingComplete } = await chrome.storage.local.get('onboardingComplete');
    if (onboardingComplete) {
      showView('view-main');
    }
  });
});

// ===== Toast =====
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 250);
  }, 2000);
}

// ===== Utilities =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function formatDate(iso) {
  const diff = Date.now() - new Date(iso);
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hour${Math.floor(diff / 3600000) > 1 ? 's' : ''} ago`;
  if (diff < 172800000) return 'Yesterday';
  return `${Math.floor(diff / 86400000)} days ago`;
}
