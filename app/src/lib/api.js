// Claude API Integration

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Note: In production, this should be an environment variable
// For MVP, we'll use a simple approach - user provides API key in UI
export const analyzeWithClaude = async (systemPrompt, userPrompt, apiKey, onProgress) => {
  onProgress?.('Initializing analysis...');
  
  try {
    onProgress?.('Analyzing job listings and financial filings...');
    
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    onProgress?.('Generating strategic intelligence report...');
    
    const data = await response.json();
    return data.content[0].text;
    
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
};
