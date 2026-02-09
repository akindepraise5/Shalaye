// ===== Options Page Script =====

const geminiKeyInput = document.getElementById('geminiKey');
const claudeKeyInput = document.getElementById('claudeKey');
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
            claudeKey: '',
            defaultLevel: 2,
            autoSave: false,
            showBadge: true
        });

        geminiKeyInput.value = settings.geminiKey;
        claudeKeyInput.value = settings.claudeKey;
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
            claudeKey: claudeKeyInput.value.trim(),
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
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ===== Event Listeners =====
saveBtn.addEventListener('click', saveSettings);

// Load settings on page load
loadSettings();
