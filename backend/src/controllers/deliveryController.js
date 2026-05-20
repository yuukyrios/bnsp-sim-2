const db = require('../config/database');

exports.getDeliveries = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT * FROM deliveries
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getDeliveryById = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM deliveries WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Delivery not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createDelivery = async (req, res) => {
    try {
        const {
            delivery_name,
            courier,
            buy_price,
            sell_price,
            weight_limit,
            type,
            status
        } = req.body;

        const [result] = await db.execute(`
            INSERT INTO deliveries
            (delivery_name, courier, buy_price, sell_price, weight_limit, type, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            delivery_name,
            courier,
            buy_price,
            sell_price,
            weight_limit,
            type,
            status || 'Processed'
        ]);

        res.status(201).json({
            success: true,
            message: 'Delivery created successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateDelivery = async (req, res) => {
    try {
        const {
            delivery_name,
            courier,
            buy_price,
            sell_price,
            weight_limit,
            type,
            status
        } = req.body;

        await db.execute(`
            UPDATE deliveries
            SET delivery_name = ?,
                courier = ?,
                buy_price = ?,
                sell_price = ?,
                weight_limit = ?,
                type = ?,
                status = ?
            WHERE id = ?
        `, [
            delivery_name,
            courier,
            buy_price,
            sell_price,
            weight_limit,
            type,
            status,
            req.params.id
        ]);

        res.json({
            success: true,
            message: 'Delivery updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteDelivery = async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM deliveries WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Delivery deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};