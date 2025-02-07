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
    const responseContent = responseData.choices[0].message.content.replace(/\\/g, '\\\\');
    const completionTime = responseData.usage.completion_time;
    const responseTokens = responseData.usage.completion_tokens;
    const completionSpeed = responseTokens / completionTime;
    chatHistoryApi.push({ role: 'assistant', content: responseContent });

    // Update local chat history
    const assistantMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        model: model,
        completion_time: completionTime,
        completion_speed: completionSpeed,
        response_tokens: responseTokens
    };

    return assistantMessage;
}