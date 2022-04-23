const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getme,
    getStaffUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getme);
router.get('/staff', protect, getStaffUsers);

module.exports = router;
