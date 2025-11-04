import { formatDate, truncateText, escapeHtml, initKonami } from './utils.js';

const STORAGE_KEY = 'base64_playground';
const MAX_HISTORY = 10;

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
    }, 500);
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
            // Encode to Base64
            result = btoa(unescape(encodeURIComponent(input)));
        } else {
            // Decode from Base64
            result = decodeURIComponent(escape(atob(input)));
        }

        // Display result
        displayResult(result);

        // Save to history
        saveToHistory(currentMode, input, result);

        // Trigger success animation
        resultText.classList.add('success');
        setTimeout(() => {
            resultText.classList.remove('success');
        }, 500);

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
    resultText.classList.add('success');
    setTimeout(() => {
        resultText.classList.remove('success');
    }, 500);
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
        }, 1500);
    }).catch(err => {
        showError('Copy error! 😞');
    });
});

// Clear Button Handler
clearButton.addEventListener('click', () => {
    inputText.value = '';
    resultText.textContent = 'The result will appear here...';
    inputText.focus();
});

// History Management
function saveToHistory(mode, input, output) {
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
}

function getHistory() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
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
                        <strong>Input:</strong> ${truncateText(entry.input, 80)}
                    </div>
                    <div class="history-output">
                        <strong>Output:</strong> ${truncateText(entry.output, 80)}
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
                processInput();
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
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy text: ', err);
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
        localStorage.removeItem(STORAGE_KEY);
        loadHistory();
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
