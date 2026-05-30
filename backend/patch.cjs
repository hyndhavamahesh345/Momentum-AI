const fs = require('fs');

const files = ['routes/goals.js', 'routes/insights.js', 'routes/checkin.js'];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replaceAll('"https://api.openai.com/v1/chat/completions"', 'process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions"');
  c = c.replaceAll('model: "gpt-4o-mini"', 'model: process.env.AI_MODEL || "openai/gpt-4o-mini"');
  c = c.replaceAll('model: "gpt-4o"', 'model: process.env.AI_MODEL_PRO || "openai/gpt-4o"');
  
  // also inject openrouter optional headers
  const headerReplacement = `headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
        "HTTP-Referer": "http://localhost:4000",
        "X-Title": "Momentum AI",
      },`;
      
  c = c.replaceAll(`headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`,
      },`, headerReplacement);
      
  fs.writeFileSync(f, c);
});

console.log('Patched API endpoints for OpenRouter support');
