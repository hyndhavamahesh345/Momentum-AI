const fs = require('fs');
const path = require('path');

const files = [
  'backend/routes/goals.js',
  'backend/routes/insights.js',
  'backend/routes/checkin.js',
  'README.md',
  'backend/.env',
  'frontend/.env'
];

files.forEach(f => {
  const filePath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(filePath)) return;
  
  let c = fs.readFileSync(filePath, 'utf8');
  
  // Replace base URLs
  c = c.replaceAll('process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions"', '"https://openrouter.ai/api/v1/chat/completions"');
  c = c.replaceAll('https://api.openai.com/v1/chat/completions', 'https://openrouter.ai/api/v1/chat/completions');
  
  // Replace variable names
  c = c.replaceAll('OPENAI_API_KEY', 'OPENROUTER_API_KEY');
  c = c.replaceAll('OPENAI_BASE_URL', 'OPENROUTER_BASE_URL');
  
  // Replace strings in UI/logs
  c = c.replaceAll('OpenAI API key', 'OpenRouter API key');
  c = c.replaceAll('Calling OpenAI...', 'Calling OpenRouter...');
  c = c.replaceAll('OpenAI API error', 'OpenRouter API error');
  c = c.replaceAll('OpenAI returned empty response', 'OpenRouter returned empty response');
  
  // README specific replacements
  c = c.replaceAll('OpenAI API', 'OpenRouter API');
  c = c.replaceAll('platform.openai.com', 'openrouter.ai');
  
  fs.writeFileSync(filePath, c);
});

console.log('Successfully switched all OpenAI references to OpenRouter project-wide!');
