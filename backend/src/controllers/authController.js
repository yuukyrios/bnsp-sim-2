const db = require('../config/database');
const { comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [rows] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = rows[0];

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = generateToken({
            id: user.id,
            username: user.username
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};