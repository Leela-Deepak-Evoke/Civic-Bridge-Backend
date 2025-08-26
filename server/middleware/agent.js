const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const genAI = new GoogleGenerativeAI(config.AGENT_KEY);

module.exports = async function getGeminiResponse(prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
};