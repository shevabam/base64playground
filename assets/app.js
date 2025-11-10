import { formatDate, truncateText, escapeHtml, initKonami } from './utils.js';
import config from './config.js';

const STORAGE_KEY = config.storage.key;
const MAX_HISTORY = config.storage.maxHistoryItems;

const inputText = document.getElementById('inputText');
const resultText = document.getElementById('resultText');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const goButton = document.getElementById('goButton');
const copyButton = document.getElementById('copyButton');
const clearButton = document.getElementById('clearButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const historyList = document.getElementById('historyList');

let currentMode = 'encode';

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    updateUI();
    initKonami();
});

// Mode Toggle Handler
modeToggle.addEventListener('change', () => {
    updateUI();
    inputText.focus();
    
    // Add animation class to button
    const button = document.getElementById('goButton');
    button.classList.add('button-pulse');
    setTimeout(() => {
        button.classList.remove('button-pulse');
    }, config.animations.buttonPulse);
});

// Update UI based on mode
function updateUI() {
    currentMode = modeToggle.checked ? 'decode' : 'encode';
    const button = document.getElementById('goButton');
    
    // Update button text and mode attribute
    const buttonText = button.querySelector('span');
    buttonText.textContent = currentMode === 'encode' ? 'Encode!' : 'Decode!';
    button.setAttribute('data-mode', currentMode);
    
    // Clear previous result
    if (resultText) {
        resultText.textContent = '';
        resultText.className = 'result-area';
    }
    
    // Update mode label if it exists
    if (modeLabel) {
        modeLabel.textContent = currentMode === 'encode' ? 'ENCODE' : 'DECODE';
    }
}

// Go Button Handler
goButton.addEventListener('click', () => {
    const input = inputText.value.trim();

    if (!input) {
        showError('Enter some text first! 🤔');
        return;
    }

    try {
        let result;

        if (currentMode === 'encode') {
            // Encode to Base64 using modern TextEncoder API
            const encoder = new TextEncoder();
            const data = encoder.encode(input);
            result = btoa(String.fromCharCode(...data));
        } else {
            // Decode from Base64 using modern TextDecoder API
            const binaryString = atob(input);
            const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
            const decoder = new TextDecoder();
            result = decoder.decode(bytes);
        }

        // Display result
        displayResult(result);

        // Save to history
        saveToHistory(currentMode, input, result);

        // Trigger success animation
        resultText.classList.add('success');
        setTimeout(() => {
            resultText.classList.remove('success');
        }, config.animations.duration);

    } catch (error) {
        if (currentMode === 'decode') {
            showError('Decoding error! Check if it\'s valid Base64. 😵');
        } else {
            showError('Encoding error! 😵');
        }
    }
});

// Display Result
function displayResult(result) {
    resultText.textContent = result;
}

// Show Error
function showError(message) {
    resultText.textContent = message;
    resultText.classList.add('error');
    setTimeout(() => {
        resultText.classList.remove('error');
    }, config.animations.duration);
}

// Copy Button Handler
copyButton.addEventListener('click', () => {
    const text = resultText.textContent;

    if (!text || text === 'The result will appear here...' || text.includes('error')) {
        showError('Nothing to copy! 📋');
        return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalText = copyButton.textContent;
        copyButton.textContent = '✓ Copied!';
        copyButton.style.background = '#4caf50';

        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.background = '';
        }, config.animations.copyFeedback);
    }).catch(err => {
        console.error('Clipboard API error:', err);
        showError('Copy error! Please try again.');
    });
});

// Clear Button Handler
clearButton.addEventListener('click', () => {
    inputText.value = '';
    resultText.textContent = 'The result will appear here...';
    inputText.focus();
});

// History Management
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        console.warn('LocalStorage is not available:', error);
        return false;
    }
}

function saveToHistory(mode, input, output) {
    if (!isLocalStorageAvailable()) {
        console.warn('Cannot save history: LocalStorage not available');
        return;
    }

    try {
        let history = getHistory();

        // Create new entry
        const entry = {
            mode: mode,
            input: input,
            output: output,
            date: new Date().toISOString()
        };

        // Add to beginning of array
        history.unshift(entry);

        // Keep only last 10 entries
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

        // Update display
        loadHistory();
    } catch (error) {
        console.error('Failed to save history:', error);
    }
}

function getHistory() {
    if (!isLocalStorageAvailable()) {
        return [];
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get history:', error);
        return [];
    }
}

function loadHistory() {
    const history = getHistory();

    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No history yet...</p>';
        return;
    }

    // Build history HTML
    historyList.innerHTML = history.map((entry, index) => {
        const date = new Date(entry.date);
        const formattedDate = formatDate(date);
        const modeClass = entry.mode === 'encode' ? 'encode' : 'decode';

        return `
            <div class="history-item" data-index="${index}">
                <div class="history-item-header">
                    <span class="history-mode ${modeClass}">${entry.mode.toUpperCase()}</span>
                    <span class="history-date">${formattedDate}</span>
                </div>
                <div class="history-content">
                    <div class="history-text">
                        <strong>Input:</strong> ${truncateText(entry.input, config.truncation.historyLength)}
                    </div>
                    <div class="history-output">
                        <strong>Output:</strong> ${truncateText(entry.output, config.truncation.historyLength)}
                        <button class="copy-output" title="Copy output">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers to history items and copy buttons
    document.querySelectorAll('.history-item').forEach(item => {
        // Handle click on the item itself
        item.addEventListener('click', (e) => {
            // Ignore clicks on the copy button
            if (e.target.closest('.copy-output')) {
                return;
            }
            
            const index = parseInt(item.dataset.index);
            const historyItem = history[index];
            if (historyItem) {
                inputText.value = historyItem.input;
                currentMode = historyItem.mode;
                updateUI();
            }
        });

        // Handle click on copy button
        const copyButton = item.querySelector('.copy-output');
        if (copyButton) {
            copyButton.addEventListener('click', async (e) => {
                e.stopPropagation(); // Prevent triggering the parent click
                const index = parseInt(item.dataset.index);
                const historyItem = history[index];
                
                if (historyItem) {
                    try {
                        await navigator.clipboard.writeText(historyItem.output);
                        // Visual feedback
                        const originalText = copyButton.innerHTML;
                        copyButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                        copyButton.style.color = 'var(--matrix-green)';
                        copyButton.style.borderColor = 'var(--matrix-green)';

                        setTimeout(() => {
                            copyButton.innerHTML = originalText;
                            copyButton.style.color = 'var(--neon-blue)';
                            copyButton.style.borderColor = 'var(--neon-blue)';
                        }, config.animations.historyFeedback);
                    } catch (err) {
                        console.error('Clipboard API error (history):', err);
                        // Visual error feedback
                        const originalText = copyButton.innerHTML;
                        copyButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                        copyButton.style.color = 'var(--neon-pink)';
                        copyButton.style.borderColor = 'var(--neon-pink)';

                        setTimeout(() => {
                            copyButton.innerHTML = originalText;
                            copyButton.style.color = 'var(--neon-blue)';
                            copyButton.style.borderColor = 'var(--neon-blue)';
                        }, config.animations.historyFeedback);
                    }
                }
            });
        }
    });
}

function loadHistoryEntry(index) {
    const history = getHistory();
    const entry = history[index];

    if (entry) {
        // Set input and mode
        inputText.value = entry.input;
        currentMode = entry.mode;
        modeToggle.checked = (currentMode === 'decode');
        
        updateUI();

        // Display result
        displayResult(entry.output);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Clear History Button Handler
clearHistoryButton.addEventListener('click', () => {
    if (confirm('Clear all history? 🗑')) {
        if (!isLocalStorageAvailable()) {
            console.warn('Cannot clear history: LocalStorage not available');
            showError('Cannot clear history!');
            return;
        }

        try {
            localStorage.removeItem(STORAGE_KEY);
            loadHistory();
        } catch (error) {
            console.error('Failed to clear history:', error);
            showError('Failed to clear history!');
        }
    }
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        goButton.click();
    }

    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearButton.click();
    }
});
