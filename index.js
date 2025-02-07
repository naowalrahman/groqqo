const LARGE_SCREEN_WIDTH = 1024;

let chatHistory = [];

var converter = new showdown.Converter();
converter.setFlavor('github');

function scrollToBottom() {
    // return;
    const responseText = document.getElementById('response-text');
    if (responseText.lastElementChild) {
        responseText.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }
}

// communicate with API with buttons, <ctrl-enter>, and on page load
// (async () => {
//     updateChatHistory(chatHistory);
//     scrollToBottom();
// })();

document.getElementById('submit').addEventListener('click', async () => {
    await submitQuestion();
});

document.getElementById('question').addEventListener('keydown', async (event) => {
    if (event.ctrlKey && event.key === 'Enter') {
        await submitQuestion();
    }
});

document.getElementById('clear-side').addEventListener('click', function() {
    document.getElementById('response-text').innerHTML = '';
    localStorage.removeItem('chatHistory');
});

async function submitQuestion() {
    const questionInput = document.getElementById('question');
    const question = questionInput.value;
    const model = window.innerWidth > LARGE_SCREEN_WIDTH ? 
        document.getElementById('model-select-button').dataset.value : 
        document.getElementById('model-select-side-button').dataset.value;
    
    if (!question) return;

    // Clear input immediately
    questionInput.value = '';
    
    // Add user message to chat immediately
    const userMessage = {
        role: 'user',
        content: question,
        timestamp: new Date().toISOString()
    };
    chatHistory.push(userMessage);
    updateChatHistory(userMessage);

    // Show loading state
    const submitButton = document.getElementById('submit');
    const sendIcon = submitButton.querySelector('.send-icon');
    const loadingIcon = submitButton.querySelector('.loading-icon');
    sendIcon.classList.add('is-hidden');
    loadingIcon.classList.remove('is-hidden');

    try {
        const assistantMessage = await askGroq(question, model);
        chatHistory.push(assistantMessage);
        updateChatHistory(assistantMessage);
    } catch (error) {
        const errorMessage = {
            role: 'assistant',
            content: error.message,
            timestamp: new Date().toISOString()
        };
        chatHistory.push(errorMessage);
        updateChatHistory(errorMessage);
    } finally {
        // Restore send icon
        sendIcon.classList.remove('is-hidden');
        loadingIcon.classList.add('is-hidden');
    }

    scrollToBottom();
}

document.getElementById('clear').addEventListener('click', async () => {
    const responseContainer = document.getElementById('response-text');

    clearHistory();
    responseContainer.innerHTML = '';
});

// run every time there's a new message
function updateChatHistory(message) {
    const responseContainer = document.getElementById('response-text');
    
    const messageDiv = document.createElement('div');
    const roleClass = message.role === 'user' ? 'user' : 'assistant';
    const timestamp = new Date(message.timestamp).toLocaleString();

    // Process content to handle <think> tags
    let content = message.content;
    if (roleClass === 'assistant') {
        // Split content into regular text and thinking sections
        let parts = content.split(/<think>|<\/think>/);
        let processedContent = '';
        
        // Process each part alternately (odd indices are thinking sections)
        parts.forEach((part, index) => {
            if (index % 2 === 0) {
                // Regular content
                if (part.trim()) {
                    processedContent += converter.makeHtml(part);
                }
            } else {
                // Thinking content
                const randomId = Math.random().toString(36).substring(2, 15);
                processedContent += `
                <div class="thinking-container">
                    <div class="thinking-header" onclick="toggleThinking('${randomId}')">
                        <span class="thinking-icon">💭</span>
                        <span class="thinking-title">Show reasoning</span>
                        <span class="thinking-arrow">▼</span>
                    </div>
                    <div id="${randomId}" class="thinking-block collapsed">
                        ${converter.makeHtml(part)}
                    </div>
                </div>`;
            }
        });
        content = processedContent;
    }
    
    const details = `<div><small>${timestamp}${roleClass === 'assistant' ? ` (${message.model} @ ${message.completion_time.toFixed(2)}s, ${message.response_tokens} tokens @ ${message.completion_speed.toFixed(1)} t/s)` : ''}</small></div>`; 
    messageDiv.innerHTML = `<div class="message ${roleClass}">${content}</div>${details}`;
    
    // Append new content
    responseContainer.appendChild(messageDiv);
    
    // Process MathJax and highlighting for new content
    MathJax.typesetPromise([messageDiv]);
    
    messageDiv.querySelectorAll('pre code').forEach((block) => {
        if (!block.previousElementSibling?.classList.contains('code-language-label')) {
            const language = block.className.split(' ')[0].replace('language-', '') || 'txt';
            const languageLabel = document.createElement('div');
            languageLabel.className = 'code-language-label';
            languageLabel.textContent = language.toUpperCase();
            block.parentNode.insertBefore(languageLabel, block);
        }
        hljs.highlightBlock(block);
        addLineNumbers(block);
    });
}

// add line numbers to code blocks
function addLineNumbers(block) {
    const lines = block.innerHTML.split('\n').length;
    const lineNumbers = Array(lines).fill(0).map((_, i) => `<span class="line-number">${i + 1}</span>`).join('');
    const lineNumbersWrapper = document.createElement('div');
    lineNumbersWrapper.className = 'line-numbers-wrapper';
    lineNumbersWrapper.innerHTML = lineNumbers;
    block.parentNode.insertBefore(lineNumbersWrapper, block);
    block.classList.add('line-numbers');
    block.style.paddingLeft = `${lineNumbersWrapper.offsetWidth + 1}px`; // Adjust padding to prevent overlap
}

// escape special HTML characters so they are displayed as text
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, function (m) {return map[m];});
}


document.getElementById('question').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

const toggler = document.querySelector('.menu__toggler');
const menu = document.querySelector('.menu');

toggler.addEventListener('click', () => {
    toggler.classList.toggle('active');
    menu.classList.toggle('active');
});

// Theme toggle functionality
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeStylesheet = document.getElementById('highlight-theme');
    if (theme === 'dark') {
        themeStylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/atom-one-dark.min.css';
    } else {
        themeStylesheet.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/atom-one-light.min.css';
    }
}

const themeToggleButtons = document.getElementsByClassName('theme-toggle');
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

for (var button of themeToggleButtons) {
    button.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

const savedTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
setTheme(savedTheme);

// Custom dropdown functionality
function setupDropdown(dropdownButtonId, dropdownContentId) {
    const dropdownButton = document.getElementById(dropdownButtonId);
    const dropdownContent = document.getElementById(dropdownContentId);

    dropdownButton.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownContent.classList.toggle('active');
    });

    dropdownContent.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            dropdownButton.textContent = item.textContent;
            dropdownButton.dataset.value = item.dataset.value;
            dropdownContent.classList.remove('active');
        });
    });

    document.addEventListener('click', (event) => {
        if (!dropdownButton.contains(event.target) && !dropdownContent.contains(event.target)) {
            dropdownContent.classList.remove('active');
        }
    });
}

setupDropdown('model-select-button', 'model-select');
setupDropdown('model-select-side-button', 'model-select-side');

// Modify clearHistory function to reset the index
function clearHistory() {
    chatHistory = [];
    chatHistoryApi = [];
    const responseContainer = document.getElementById('response-text');
    responseContainer.innerHTML = '';
}

// Add this function at the end of the file
function toggleThinking(id) {
    const block = document.getElementById(id);
    const header = block.previousElementSibling;
    const title = header.querySelector('.thinking-title');
    const arrow = header.querySelector('.thinking-arrow');
    
    block.classList.toggle('collapsed');
    title.textContent = block.classList.contains('collapsed') ? 'Show reasoning' : 'Hide reasoning';
    arrow.style.transform = block.classList.contains('collapsed') ? 'rotate(0deg)' : 'rotate(180deg)';
}
