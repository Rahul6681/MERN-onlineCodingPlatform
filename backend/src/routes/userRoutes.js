const express = require('express');
const router = express.Router();
const { getMyProfile, updateMyProfile, getUserById, getAllUsersAdmin, toggleUserBan } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

router.get('/profile/me', protect, getMyProfile);
router.put('/profile/me', protect, updateMyProfile);
router.get('/profile/:userId', protect, getUserById);

// Admin routes
router.get('/admin/users', protect, roleGuard('admin'), getAllUsersAdmin);
router.patch('/admin/users/:id/ban', protect, roleGuard('admin'), toggleUserBan);

module.exports = router;
