const mongoose = require('mongoose');

console.log('🔄 Testing MongoDB connection...');

// Connect to local MongoDB
mongoose.connect('mongodb://localhost:27017/mlrit-events', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB!');
    console.log('📊 Database: mlrit-events');
    process.exit(0);
})
.catch(err => {
    console.error('❌ FAILED: MongoDB connection error:', err.message);
    console.log('💡 Make sure MongoDB service is running: net start MongoDB');
    process.exit(1);
});