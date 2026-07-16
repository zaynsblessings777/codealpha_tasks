const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messagesContainer');
const typingIndicator = document.getElementById('typingIndicator');
const clearBtn = document.getElementById('clearBtn');
const faqList = document.getElementById('faqList');
const toggleFaqBtn = document.getElementById('toogleFaqBtn');

// Load FAQs when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadFAQs();
});

/**
 *  Handle form submission (when user sends a message)
 */
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // Display user message in chat
    displayMessage(message, 'user');
    userInput.value = '';

    // show typing indicator
    typingIndicator.style.display = 'flex';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // Send question to Flask backend
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('API error');
        }

        const data = await response.json();

        // Hide typing indicator
        typingIndicator.style.display = 'none';

        if (data.success) {
            // Display bot response with confidence
            displayBotResponse(
                data.answer,
                data.matched_question,
                data.confidence,
                data.match_found
            );
        } else {
            displayMessage('Sorry, an error occurred.', 'bot');
        }

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
        console.error('Error:', error);
        typingIndicator.style.display = 'none';
        displayMessage('Unable to connect to the server. Is Flask running?', 'bot');
    }
});

/**
 * Display a message in the chat
 */
function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    const avatar = sender === 'user' ? '👤' : '🤖';

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">${escapeHtml(text)}</div>
    `;

    messagesContainer.appendChild(messageDiv);
}

/**
 * Display bot response with confidence badge
 */
function displayBotResponse(answer, matchedQuestion, confidence, matchFound) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot-message');

    // Determine confidence level
    let confidenceClass = 'confidence-low';
    if (confidence >= 70) confidenceClass = 'confidence-high';
    else if (confidence >= 50) confidenceClass = 'confidence-medium';

    // Build response content
    let content = `<div class="message-avatar">🤖</div>`;
    content += `<div class="message-content">`;
    content += `<p>${escapeHtml(answer)}</p>`;

    // Add confidence badge
    content += `<div class="confidence-badge ${confidenceClass}">
        Confidence: ${confidence.toFixed(1)}%
    </div>`;

    if (matchedQuestion && matchFound) {
        content += `<div style="font-size: 12px; margin-top: 8px; color: #999;">
            <em>Matched: "${escapeHtml(matchedQuestion)}"</em>
        </div>`;
    }
    content += `</div>`;
    messageDiv.innerHTML = content;

    messagesContainer.appendChild(messageDiv);
}

/**
 * Load all FAQs from backend and display in sidebar
 */
async function loadFAQs() {
    try {
        const response = await fetch('/api/faqs');
        if (!response.ok) throw new Error('Failed to load FAQs');

        const data = await response.json();

        if (data.success && data.faqs) {
            faqList.innerHTML = '';

            data.faqs.forEach(faq => {
                const faqItem = document.createElement('div');
                faqItem.classList.add('faq-item');
                faqItem.innerHTML = `
                    <strong>Q${faq.id}:</strong>
                    ${escapeHtml(faq.question)}
                `;
                // Click to insert into input
                faqItem.addEventListener('click', () => {
                    userInput.value = faq.question;
                    userInput.focus();
                });

                faqList.appendChild(faqItem);
            });
        }
    } catch (error) {
        console.error('Error loading FAQs:', error);
        faqList.innerHTML = '<p class="loading">Failed to load FAQs</p>';
    }
}

/**
 * Clear chat history
 */
clearBtn.addEventListener('click', () => {
    const allMessages = messagesContainer.querySelectorAll('.message');
    allMessages.forEach(msg => msg.remove());

    // Re-add welcome message
    const welcomeDiv = document.createElement('div');
    welcomeDiv.classList.add('message', 'bot-message', 'welcome-message');
    welcomeDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p><strong>Welcome to Tech Support!</strong></p>
            <p>I'm here to help answer your questions about our software. Just ask me anything!</p>
        </div>
    `;
    messagesContainer.appendChild(welcomeDiv);

    userInput.focus();
});

/**
 * Toggle FAQ panel
 */
toggleFaqBtn.addEventListener('click', () => {
    const faqPanel = document.querySelector('.faq-panel');
    const isHidden = faqPanel.style.display === 'none';
    faqPanel.style.display = isHidden ? 'flex' : 'none';
    toggleFaqBtn.textContent = isHidden ? '-' : '+';
});

/**
 * Quick topic buttons
 */
document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const topic = btn.getAttribute('data-topic');
        const queries = {
            password: 'How do I reset my password?',
            crash: 'What should I do if my app keeps crashing?',
            security: 'Is my data encrypted and secure?',
            settings: 'How can I update my profile information?',
            support: 'How do I contact customer support?'
        };

        userInput.value = queries[topic] || '';
        userInput.focus();
    });
});

/**
 * Escape HTML special characters for security
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Focus input on page load
 */
window.addEventListener('load', () => {
    userInput.focus();
});

/**
 * Handle Enter key
 */
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});