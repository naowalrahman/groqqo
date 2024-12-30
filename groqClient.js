let chatHistory = [];
let chatHistoryApi = [];

async function askGroq(question, model) {
    const apiKeySelect = document.getElementById('api-key-select');
    const apiKey = apiKeySelect ? apiKeySelect.value : localStorage.getItem('groq_api_key');
    if (!apiKey) {
        throw new Error('API Key is not set. Please set your API Key.');
    }

    chatHistoryApi.push({ role: 'user', content: question });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            messages: chatHistoryApi,
            model
        })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch response from Groq API');
    }

    const responseData = await response.json();
    const responseContent = responseData.choices[0].message.content;
    const completionTime = responseData.usage.total_time;
    chatHistoryApi.push({ role: 'assistant', content: responseContent });

    // Update local chat history
    const userMessage = { role: 'user', content: question, timestamp: new Date().toISOString() };
    const assistantMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        model: model,
        completion_time: completionTime
    };

    chatHistory.push(userMessage);
    chatHistory.push(assistantMessage);

    return { content: responseContent, completionTime };
}

function clearHistory() {
    chatHistory = [];
}