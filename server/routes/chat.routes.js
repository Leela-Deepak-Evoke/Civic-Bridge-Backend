const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');


// POST: Add a new chat message
router.post('/', chatController.addChatMessage);

// GET: Get all chats by a user
router.get('/:userId', chatController.getUserChats);

module.exports = router;