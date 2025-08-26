
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3212,
  MONGO_URI: process.env.MONGODB_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  NODE_ENV: process.env.NODE_ENV || "development",
  LOGIN_URL: process.env.LOGIN_URL,
  AGENT_KEY: process.env.GEMINI_API_KEY,
  CIVISENSE_PROMPT: process.env.CIVISENSE_PROMPT
};