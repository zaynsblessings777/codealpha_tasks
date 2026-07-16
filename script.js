// Get elements
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const sourceLang = document.getElementById('source-lang');
const targetLang = document.getElementById('target-lang');
const translateBtn = document.getElementById('translate-btn');
const copyBtn = document.getElementById('copy-btn');
const speakBtn = document.getElementById('speak-btn');
const swapBtn = document.getElementById('swap-btn');
const statusDiv = document.getElementById('status');
const charInput = document.getElementById('char-input');
const darkModeBtn = document.getElementById('dark-mode-btn');

// Dark mode
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Character counter
inputText.addEventListener('input', () => {
    charInput.textContent = inputText.value.length;
});

// Translate function
translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    
    if (!text) {
        showStatus('Please enter text to translate', 'error');
        return;
    }
    
    showStatus('Translating...', 'loading');
    setLoadingState(true);
    
    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                source_lang: sourceLang.value,
                target_lang: targetLang.value
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            outputText.value = data.translated_text;
            showStatus('Translation complete! ✓', 'success');
            setTimeout(() => statusDiv.style.display = 'none', 3000);
        } else {
            showStatus('Error: ' + data.error, 'error');
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
    } finally {
        setLoadingState(false);
    }
});

// Copy button with feedback
copyBtn.addEventListener('click', () => {
    const text = outputText.value;
    
    if (!text) {
        showStatus('Nothing to copy', 'error');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showStatus('✓ Copied to clipboard!', 'success');
        copyBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            copyBtn.style.transform = 'scale(1)';
            statusDiv.style.display = 'none';
        }, 2000);
    }).catch(err => {
        showStatus('Failed to copy', 'error');
    });
});

// Text-to-Speech
speakBtn.addEventListener('click', () => {
    const text = outputText.value;
    
    if (!text) {
        showStatus('Nothing to speak', 'error');
        return;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang.value;
    utterance.rate = 0.9;
    
    utterance.onstart = () => {
        showStatus('🔊 Speaking...', 'loading');
        speakBtn.style.transform = 'scale(0.95)';
    };
    
    utterance.onend = () => {
        showStatus('✓ Finished speaking!', 'success');
        speakBtn.style.transform = 'scale(1)';
        setTimeout(() => statusDiv.style.display = 'none', 2000);
    };
    
    utterance.onerror = () => {
        showStatus('Error speaking text', 'error');
        speakBtn.style.transform = 'scale(1)';
    };
    
    window.speechSynthesis.speak(utterance);
});

// Swap languages
swapBtn.addEventListener('click', () => {
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp;
    
    // Swap text if translation exists
    if (outputText.value) {
        const tempText = inputText.value;
        inputText.value = outputText.value;
        outputText.value = tempText;
        charInput.textContent = inputText.value.length;
    }
});

// Status message
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
}

// Loading state
function setLoadingState(isLoading) {
    const btnText = translateBtn.querySelector('.btn-text');
    const spinner = translateBtn.querySelector('.loading-spinner');
    
    if (isLoading) {
        translateBtn.disabled = true;
        translateBtn.classList.add('loading');
        btnText.style.display = 'none';
        spinner.style.display = 'inline-block';
    } else {
        translateBtn.disabled = false;
        translateBtn.classList.remove('loading');
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

// Clear status on input
inputText.addEventListener('input', () => {
    if (statusDiv.textContent && !statusDiv.classList.contains('loading')) {
        statusDiv.style.display = 'none';
    }
});

// Allow Enter key to translate (Ctrl+Enter)
inputText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        translateBtn.click();
    }
});