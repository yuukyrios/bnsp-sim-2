const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {
    getDeliveries,
    getDeliveryById,
    createDelivery,
    updateDelivery,
    deleteDelivery
} = require('../controllers/deliveryController');

router.get('/', auth, getDeliveries);
router.get('/:id', auth, getDeliveryById);
router.post('/', auth, createDelivery);
router.put('/:id', auth, updateDelivery);
router.delete('/:id', auth, deleteDelivery);

module.exports = router;