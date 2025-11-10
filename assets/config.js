/**
 * Configuration file for Base64 Playground
 * Central place for all application constants and settings
 */

const config = {
    // Storage configuration
    storage: {
        key: 'base64_playground',
        maxHistoryItems: 10
    },

    // Animation durations (in milliseconds)
    animations: {
        duration: 500,           // Standard animation duration
        copyFeedback: 1500,      // Copy button feedback duration
        historyFeedback: 2000,   // History copy button feedback duration
        buttonPulse: 500         // Button pulse animation duration
    },

    // Text truncation settings
    truncation: {
        historyLength: 80        // Maximum characters before truncation in history
    }
};

export default config;
