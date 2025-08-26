const Chat = require('../models/Chat.model');
const Issue = require('../models/Issue.model');
const getGeminiResponse = require('../middleware/agent');
const config = require('../config/config');

// ✅ Add a new chat message with AI response
const addChatMessage = async (req, res) => {
  try {
    const { userId, question } = req.body;

    if (!userId || !question) {
      return res.status(400).json({ success: false, message: "UserId and question are required." });
    }

    // 1️⃣ Check if same question exists in DB for this user
    const existingChat = await Chat.findOne({
      userId,
      question: { $regex: new RegExp(`^${question}$`, 'i') } // case-insensitive match
    });

    if (existingChat) {
      return res.status(200).json({ success: true, data: existingChat });
    }

    // 2️⃣ Fetch latest project context
    const issues = await Issue.find().sort({ createdAt: -1 });

    function cleanForSpeech(text) {
      return text
        .replace(/\\[nrt]/g, ' ')       // remove escaped \n, \t, \r
        .replace(/\\"/g, '"')           // unescape double quotes
        .replace(/\\'/g, "'")           // unescape single quotes
        .replace(/[`*_#>~\-]/g, '')     // remove markdown & special symbols
        .replace(/[{}[\]|\\^]/g, '')    // remove misc symbols
        .replace(/\s+/g, ' ')           // collapse multiple spaces
        .replace(/\s([?.!])/g, '$1')    // remove space before punctuation
        .trim();                        // remove leading/trailing spaces
    }

    const projectContext = issues.map(issue => {
      return `Title: ${issue.title}
              Description: ${issue.description}
              Location: ${issue.location}
              Status: ${issue.status}
              Reported By: ${issue.reportedBy?.name || "Unknown"}
              Flags: Critical=${issue.flags.isCritical}, Duplicate=${issue.flags.isDuplicate}`;
    }).join('\n\n');

    const fullPrompt = config.CIVISENSE_PROMPT
      .replace(/\\n/g, '\n')
      .replace('${projectContext}', projectContext)
      .replace('${question}', question);

    // 3️⃣ Get AI answer
    const answer = await getGeminiResponse(fullPrompt);
    const formattedAnswer = cleanForSpeech(answer);

    // 4️⃣ Save chat to DB
    const newChat = new Chat({ userId, question, answer: formattedAnswer });
    await newChat.save();

    res.status(201).json({ success: true, data: newChat });

  } catch (error) {
    console.error("Chat AI error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📄 Get all chat messages by a user
const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ userId })
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addChatMessage,
  getUserChats
};
