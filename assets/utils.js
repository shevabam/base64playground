/**
 * Format a date to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Just now';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // For older dates, use full date format
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Truncate text and add ellipsis if too long
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return escapeHtml(text);
    }
    return escapeHtml(text.substring(0, maxLength)) + '...';
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Konami Code
const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
let konamiIndex = 0;

function activateKonami() {
    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalBg = body.style.background;
    
    body.style.overflow = 'auto';
    body.style.background = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)';
    body.style.backgroundSize = '400% 400%';
    body.style.animation = 'rainbow 3s ease infinite';
    body.style.transition = 'all 0.3s';
    
    const message = document.createElement('div');
    message.textContent = 'KONAMI CODE: ON';
    message.style.position = 'fixed';
    message.style.top = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    message.style.color = '#fff';
    message.style.padding = '15px 30px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '9999';
    message.style.fontFamily = '"Press Start 2P", cursive, monospace';
    message.style.fontSize = '16px';
    message.style.letterSpacing = '2px';
    message.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.7)';
    message.style.border = '2px solid white';
    message.style.animation = 'bounce 0.5s infinite alternate';
    
    document.body.insertBefore(message, document.body.firstChild);
    
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-20px';
            confetti.style.zIndex = '9998';
            confetti.style.pointerEvents = 'none';
            document.body.appendChild(confetti);
            
            const duration = Math.random() * 3 + 2;
            confetti.style.transition = `all ${duration}s linear`;
            
            setTimeout(() => {
                confetti.style.top = '100vh';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
                confetti.remove();
            }, duration * 1000);
        }, i * 100);
    }
    
    setTimeout(() => {
        message.style.animation = 'none';
        message.style.transform = 'translateX(-50%) scale(0.9)';
        message.style.opacity = '0';
        message.style.transition = 'all 0.5s ease';
        
        body.style.animation = 'none';
        body.style.background = originalBg;
        body.style.backgroundSize = '';
        
        setTimeout(() => {
            message.remove();
            body.style.overflow = originalOverflow;
        }, 500);
    }, 5000);
}

function initKonami() {
    document.addEventListener('keydown', (e) => {        
        if (e.keyCode === KONAMI_CODE[konamiIndex]) {
            konamiIndex++;
            
            if (konamiIndex === KONAMI_CODE.length) {
                activateKonami();
                konamiIndex = 0;
            }
        } else if (konamiIndex > 0) {
            konamiIndex = 0;
        }
    });
}

export { formatDate, truncateText, escapeHtml, generateId, initKonami };
