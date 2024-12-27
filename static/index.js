const LARGE_SCREEN_WIDTH = 768;

const savedTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');
setTheme(savedTheme);

var converter = new showdown.Converter();
converter.setFlavor('github');

function scrollToBottom() {
    return;
    const responseText = document.getElementById('response-text');
    if (responseText.lastElementChild) {
        responseText.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }
}

// communicate with API with buttons and on page load
(async () => {
    const history = await fetch('/history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const result = await history.json();
    updateChatHistory(result.history);
    scrollToBottom();
})();

document.getElementById('submit').addEventListener('click', async () => {
    const question = document.getElementById('question').value;
    const model = window.innerWidth > LARGE_SCREEN_WIDTH ? document.getElementById('model-select-button').dataset.value : document.getElementById('model-select-side-button').dataset.value;
    if (!question) return;

    const responseContainer = document.getElementById('response-text');

    const response = await fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, model })
    });

    const result = await response.json();
    if (result.error) {
        responseContainer.innerHTML += `<div class="message has-text-danger">${result.error}</div>`;
    } else {
        updateChatHistory(result.history);
    }

    document.getElementById('question').value = '';
    scrollToBottom();
});

document.getElementById('clear').addEventListener('click', async () => {
    const responseContainer = document.getElementById('response-text');

    await fetch('/clear', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    responseContainer.innerHTML = '';
});

// run every time the chat history is updated
function updateChatHistory(history) {
    const responseContainer = document.getElementById('response-text');
    responseContainer.innerHTML = '';
    history.forEach(entry => {
        const roleClass = entry.role === 'user' ? 'user' : 'assistant';
        const timestamp = new Date(entry.timestamp).toLocaleString();
        const details = `<div><small>${timestamp}${roleClass === 'assistant' ? ` (${entry.model} @ ${entry.completion_time.toFixed(2)}s)` : ''}</small></div>`; 
        responseContainer.innerHTML += `<div class="message ${roleClass}">${converter.makeHtml(entry.content)}</div>${details}`;
    });
    MathJax.typesetPromise([responseContainer]);
    document.querySelectorAll('pre code').forEach((block) => {
        if (!block.previousElementSibling || !block.previousElementSibling.classList.contains('code-language-label')) {
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
