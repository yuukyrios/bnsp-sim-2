const db = require('../config/database');
const { hashPassword } = require('../utils/passwordUtils');

exports.getAdmins = async (req, res) => {
    try {
        const [admins] = await db.execute(
            'SELECT id, username, created_at FROM users ORDER BY id DESC'
        );

        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [existing] = await db.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const hashedPassword = await hashPassword(password);

        const [result] = await db.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM users WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};