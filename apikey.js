document.getElementById('save-api-key').addEventListener('click', () => {
    const apiKey = document.getElementById('api-key-input').value;
    if (apiKey) {
        let apiKeys = JSON.parse(localStorage.getItem('groq_api_keys')) || [];
        apiKeys.push(apiKey);
        localStorage.setItem('groq_api_keys', JSON.stringify(apiKeys));
        populateApiKeySelect();
        showMessage('API Key saved successfully!', 'is-success');
    } else {
        showMessage('Please enter a valid API Key.', 'is-danger');
    }
});

document.getElementById('delete-api-key').addEventListener('click', () => {
    const apiKeySelect = document.getElementById('api-key-select');
    const selectedApiKey = apiKeySelect.value;
    if (selectedApiKey) {
        let apiKeys = JSON.parse(localStorage.getItem('groq_api_keys')) || [];
        apiKeys = apiKeys.filter(key => key !== selectedApiKey);
        localStorage.setItem('groq_api_keys', JSON.stringify(apiKeys));
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
});
