const express = require('express');
const router = express.Router({mergeParams:true});
const {
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/comment.controller');

const { authenticate } = require('../middleware/firebaseAuth');

// Add Comment → Any authenticated user
router.post('/', authenticate, addComment);

// Update Comment → Only the owner of the comment
router.put('/:commentId', authenticate, updateComment);

// Delete Comment → Owner or admin
router.delete('/:commentId', authenticate, deleteComment);

module.exports = router;
