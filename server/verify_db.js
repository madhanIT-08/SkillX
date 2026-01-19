const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected successfully.');

        console.log('Creating test user...');
        // Create a unique email to avoid duplicates
        const testUser = new User({
            name: 'Console Test User',
            email: `test_console_${Date.now()}@example.com`,
            password: 'password123',
            skillsOffered: ['Testing', 'Debugging']
        });

        const savedUser = await testUser.save();
        console.log('---------------------------------------------------');
        console.log('SUCCESS! Code executed and data written to database.');
        console.log('---------------------------------------------------');
        console.log('User ID:', savedUser._id);
        console.log('Name:', savedUser.name);
        console.log('Email:', savedUser.email);
        console.log('Database:', mongoose.connection.name);
        console.log('---------------------------------------------------');

        process.exit();
    } catch (error) {
        console.error('Error executing code:', error);
        process.exit(1);
    }
};

testDB();
