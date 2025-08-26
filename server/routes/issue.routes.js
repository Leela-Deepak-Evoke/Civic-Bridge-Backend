const express = require('express');
const router = express.Router();

const {
  createIssue,
  updateIssue,
  getAllIssues,
  getUserIssues,
  deleteIssue,
  getIssuesByLocation,
  getIssuesByStatus,
  getIssuesByFlag
} = require('../controllers/issue.controller');

const { authenticate, authorizeRoles } = require('../middleware/firebaseAuth');

// ✅ Issue creation: user
router.post('/', authenticate, createIssue);

// ✅ Update Issue: user (owner) or admin (authorization handled in controller)
router.put('/:id', authenticate, updateIssue);

// ✅ Get all issues: any authenticated user
router.get('/', authenticate, getAllIssues);

// ✅ Get issues by location: any authenticated user
router.get('/location/:location', authenticate, getIssuesByLocation);

// ✅ Get issues by userId (owner or admin)
router.get('/user', authenticate, getUserIssues);

// ✅ Get issues by status: any authenticated user
router.get('/status/:status', authenticate, getIssuesByStatus);

// ✅ Get issues by flag: only admin
router.get('/flag/:flagType', authenticate, authorizeRoles('admin'), getIssuesByFlag);

// ✅ Delete issue: user (owner) or admin (authorization handled in controller)
router.delete('/:id', authenticate, deleteIssue);

module.exports = router;
