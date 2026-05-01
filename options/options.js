// ===== Options Page Script =====

const geminiKeyInput = document.getElementById('geminiKey');
const groqKeyInput = document.getElementById('groqKey');
const defaultLevelSelect = document.getElementById('defaultLevel');
const autoSaveCheckbox = document.getElementById('autoSave');
const showBadgeCheckbox = document.getElementById('showBadge');
const saveBtn = document.getElementById('saveBtn');
const toast = document.getElementById('toast');

// ===== Load Settings =====
async function loadSettings() {
    try {
        const settings = await chrome.storage.sync.get({
            geminiKey: '',
            groqKey: '',
            defaultLevel: 2,
            autoSave: false,
            showBadge: true
        });

        geminiKeyInput.value = settings.geminiKey;
        groqKeyInput.value = settings.groqKey;
        defaultLevelSelect.value = settings.defaultLevel;
        autoSaveCheckbox.checked = settings.autoSave;
        showBadgeCheckbox.checked = settings.showBadge;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ===== Save Settings =====
async function saveSettings() {
    try {
        await chrome.storage.sync.set({
            geminiKey: geminiKeyInput.value.trim(),
            groqKey: groqKeyInput.value.trim(),
            defaultLevel: parseInt(defaultLevelSelect.value),
            autoSave: autoSaveCheckbox.checked,
            showBadge: showBadgeCheckbox.checked
        });

        showToast('Settings saved!');
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Failed to save settings');
    }
}

// ===== Show Toast =====
function showToast(message) {
    toast.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
        </svg>
        ${message}
    `;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ===== Event Listeners =====
saveBtn.addEventListener('click', saveSettings);

const headerLogo = document.querySelector('.header-logo');
if (headerLogo) {
    headerLogo.style.cursor = 'pointer';
    headerLogo.title = 'Go to Home';
    headerLogo.addEventListener('click', () => {
        window.location.href = '../popup/popup.html';
    });
}

// Load settings on page load
loadSettings();
