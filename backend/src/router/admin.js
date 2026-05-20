const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {
    getAdmins,
    createAdmin,
    deleteAdmin
} = require('../controllers/adminController');

router.get('/', auth, getAdmins);
router.post('/', auth, createAdmin);
router.delete('/:id', auth, deleteAdmin);

module.exports = router;