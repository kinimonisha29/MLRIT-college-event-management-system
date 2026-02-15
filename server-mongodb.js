const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000; // Changed back to 3000 for your main site

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/mlrit-events';

console.log('🔄 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB!');
    console.log('📊 Database: mlrit-events');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
});

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const registrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, required: true },
    eventType: { type: String, required: true },
    fullName: String,
    email: String,
    phone: String,
    department: String,
    eventData: mongoose.Schema.Types.Mixed, // Stores all form data
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Registration = mongoose.model('Registration', registrationSchema);

// ===== USER REGISTRATION & LOGIN =====
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        // Create user (simple version without password hashing for now)
        const newUser = new User({
            username,
            email,
            password, // In production, you should hash this
            role: 'user'
        });

        await newUser.save();
        console.log('👤 New user registered:', username);
        
        res.json({
            success: true,
            message: 'Registration successful!',
            user: { username, email }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.json({ success: false, message: 'Registration failed: ' + error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password required' });
        }

        // Find user (simple authentication for demo)
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        res.json({
            success: true,
            message: 'Login successful!',
            user: { username: user.username, email: user.email }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: 'Login failed' });
    }
});

// ===== EVENT REGISTRATION (MAIN FUNCTIONALITY) =====
app.post('/api/register', async (req, res) => {
    try {
        const registrationData = {
            username: req.body.username || 'guest',
            eventType: req.body.eventType,
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            eventData: req.body // Store all form data
        };

        const newRegistration = new Registration(registrationData);
        await newRegistration.save();

        console.log('🎯 New registration saved:', registrationData.eventType);
        
        res.json({ 
            success: true, 
            message: 'Registration successful!',
            data: newRegistration
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.json({ success: false, message: 'Registration failed: ' + error.message });
    }
});

// ===== GET ALL REGISTRATIONS (FOR ADMIN DASHBOARD) =====
app.get('/api/registrations', async (req, res) => {
    try {
        const registrations = await Registration.find().sort({ timestamp: -1 });
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.json([]);
    }
});

// ===== GET REGISTRATION STATS =====
app.get('/api/stats', async (req, res) => {
    try {
        const totalRegistrations = await Registration.countDocuments();
        const eventStats = await Registration.aggregate([
            { $group: { _id: '$eventType', count: { $sum: 1 } } }
        ]);

        res.json({
            totalRegistrations,
            eventStats
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.json({ totalRegistrations: 0, eventStats: [] });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`📁 Frontend served from: ../frontend`);
    console.log(`🗄️ Database: MongoDB`);
    console.log(`✅ All registration forms will now save to MongoDB!`);
});