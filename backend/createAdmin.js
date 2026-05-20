require('dotenv').config();

const readline = require('readline');
const db = require('./src/config/database');
const { hashPassword } = require('./src/utils/passwordUtils');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
};

const createAdmin = async () => {
    try {
        console.log('\n=== CargoMoms Admin Creator ===\n');

        const username = await askQuestion('Enter admin username: ');
        const password = await askQuestion('Enter admin password: ');

        if (!username.trim() || !password.trim()) {
            console.log('\nUsername and password cannot be empty.\n');
            rl.close();
            process.exit();
        }

        const [existing] = await db.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            console.log('\nUsername already exists.\n');
            rl.close();
            process.exit();
        }

        const hashedPassword = await hashPassword(password);

        await db.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        console.log('\nAdmin created successfully!');
        console.log(`Username: ${username}\n`);

        rl.close();
        process.exit();
    } catch (error) {
        console.error('\nError creating admin:', error.message);
        rl.close();
        process.exit(1);
    }
};

createAdmin();