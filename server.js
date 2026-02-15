const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/mlrit-events')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    createdAt: { type: Date, default: Date.now }
});

// Registration Schema
const registrationSchema = new mongoose.Schema({
    username: String,
    eventType: String,
    fullName: String,
    email: String,
    phone: String,
    department: String,
    eventData: Object,
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Registration = mongoose.model('Registration', registrationSchema);

// ===== AUTH ROUTES =====
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.json({ success: false, message: 'User already exists' });
        }
        const user = new User({ username, email, password });
        await user.save();
        res.json({
            success: true,
            message: 'Registration successful!',
            user: { username, email }
        });
    } catch (error) {
        res.json({ success: false, message: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            res.json({
                success: true,
                message: 'Login successful!',
                user: { username: user.username, email: user.email }
            });
        } else {
            res.json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.json({ success: false, message: 'Login failed' });
    }
});

// ===== EVENT REGISTRATION ROUTES =====
app.post('/api/register', async (req, res) => {
    try {
        const registrationData = {
            username: req.body.username || 'guest',
            eventType: req.body.eventType,
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            eventData: req.body
        };
        const newRegistration = new Registration(registrationData);
        await newRegistration.save();
        console.log('✅ New registration saved:', registrationData.eventType);
        res.json({ success: true, message: 'Registration successful!', data: newRegistration });
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, message: 'Registration failed: ' + error.message });
    }
});

app.get('/api/registrations', async (req, res) => {
    try {
        const registrations = await Registration.find().sort({ timestamp: -1 });
        res.json(registrations);
    } catch (error) {
        console.error('Error:', error);
        res.json([]);
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const totalRegistrations = await Registration.countDocuments();
        const eventStats = await Registration.aggregate([
            { $group: { _id: '$eventType', count: { $sum: 1 } } }
        ]);
        res.json({ totalRegistrations, eventStats });
    } catch (error) {
        console.error('Error:', error);
        res.json({ totalRegistrations: 0, eventStats: [] });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
});