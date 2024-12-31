document.getElementById('save-api-key').addEventListener('click', () => {
    const apiKey = document.getElementById('api-key-input').value;
    if (apiKey) {
        let apiKeys = JSON.parse(localStorage.getItem('groq_api_keys')) || [];
        apiKeys.push(apiKey);
        if (apiKeys.length === 1) {
            localStorage.setItem('groq_api_key', apiKey);
        }
        localStorage.setItem('groq_api_keys', JSON.stringify(apiKeys));
        populateApiKeySelect();
        showMessage('API Key saved successfully!', 'is-success');
    } else {
        showMessage('Please enter a valid API Key.', 'is-danger');
    }
});

document.getElementById('delete-api-key').addEventListener('click', () => {
    const selectedApiKey = apiKeySelect.value;
    if (selectedApiKey) {
        let apiKeys = JSON.parse(localStorage.getItem('groq_api_keys')) || [];
        apiKeys = apiKeys.filter(key => key !== selectedApiKey);
        localStorage.setItem('groq_api_keys', JSON.stringify(apiKeys));
        
        // Clear the groq_api_key variable if it matches the selected API key
        const currentApiKey = localStorage.getItem('groq_api_key');
        if (currentApiKey === selectedApiKey) {
            localStorage.removeItem('groq_api_key');
        }

        populateApiKeySelect();
        showMessage('API Key deleted successfully!', 'is-success');
    } else {
        showMessage('Please select an API Key to delete.', 'is-danger');
    }
});

function populateApiKeySelect() {
    const apiKeySelect = document.getElementById('api-key-select');
    apiKeySelect.innerHTML = '';
    const apiKeys = JSON.parse(localStorage.getItem('groq_api_keys')) || [];
    apiKeys.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        apiKeySelect.appendChild(option);
    });

}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `notification ${type}`;
    messageDiv.classList.remove('is-hidden');
    setTimeout(() => {
        messageDiv.classList.add('is-hidden');
    }, 3000);
}

// Load the saved API keys on page load
document.addEventListener('DOMContentLoaded', () => {
    populateApiKeySelect();
    setApiSelectValue();
});

function setApiSelectValue() {
    const selectedApiKey = localStorage.getItem('groq_api_key');
    if (selectedApiKey) {
        apiKeySelect.value = selectedApiKey;
    }
}

// Set the selected API key as the one to use
const apiKeySelect = document.getElementById('api-key-select');

setApiSelectValue();

apiKeySelect.addEventListener('change', () => {
    localStorage.setItem('groq_api_key', apiKeySelect.value);
    showMessage('API Key selected successfully!', 'is-success');
});