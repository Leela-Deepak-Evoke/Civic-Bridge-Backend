// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    logoutUser,
    loginUser,
    createUser,
    getUsers,
    singleUser,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');

const { authenticate, authorizeRoles } = require('../middleware/firebaseAuth');

// ✅ Login From Here
router.post('/login', loginUser);

// ✅ Logout From Here
router.post('/logout', authenticate, logoutUser);

// ✅ Anyone can create their profile (e.g., after Firebase signup)
router.post('/',createUser);

// ✅ Only Admin can view all users
router.get('/', authenticate, authorizeRoles('admin'), getUsers);

// ✅ Users can access and update their own info, or admin can access anyone
router.get('/:id', authenticate, singleUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

module.exports = router;
