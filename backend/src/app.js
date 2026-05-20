const express = require('express');
const cors = require('cors');

const authRoutes = require('./router/auth');
const deliveryRoutes = require('./router/delivery'); // ← ADD THIS
const adminRoutes = require('./router/admin');        // ← ADD THIS
const itemRoutes = require('./router/item');          // ← ADD THIS

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({
        message: 'CargoMoms API Running Successfully'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/delivery', deliveryRoutes); // ← ADD THIS
app.use('/api/admin', adminRoutes);       // ← ADD THIS
app.use('/api/item', itemRoutes);         // ← ADD THIS

module.exports = app; 