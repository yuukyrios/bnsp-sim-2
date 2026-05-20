const db = require('../config/database');

exports.getItems = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                items.*,
                deliveries.delivery_name
            FROM items
            LEFT JOIN deliveries
                ON items.delivery_id = deliveries.id
            ORDER BY items.created_at DESC
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

exports.createItem = async (req, res) => {
    try {
        const {
            delivery_id,
            item_name,
            customer,
            item_weight
        } = req.body;

        const [result] = await db.execute(`
            INSERT INTO items
            (delivery_id, item_name, customer, item_weight)
            VALUES (?, ?, ?, ?)
        `, [
            delivery_id || null,
            item_name,
            customer,
            item_weight
        ]);

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const {
            delivery_id,
            item_name,
            customer,
            item_weight
        } = req.body;

        await db.execute(`
            UPDATE items
            SET delivery_id = ?,
                item_name = ?,
                customer = ?,
                item_weight = ?
            WHERE id = ?
        `, [
            delivery_id || null,
            item_name,
            customer,
            item_weight,
            req.params.id
        ]);

        res.json({
            success: true,
            message: 'Item updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM items WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};