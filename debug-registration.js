const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mlrit-events')
.then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const Registration = mongoose.model('Registration', new mongoose.Schema({
        username: String,
        eventType: String,
        fullName: String,
        email: String,
        timestamp: Date
    }));
    
    // Test saving directly
    const testReg = new Registration({
        username: 'debug-test',
        eventType: 'debug',
        fullName: 'Debug User',
        email: 'debug@test.com',
        timestamp: new Date()
    });
    
    await testReg.save();
    console.log('✅ Debug registration saved to MongoDB');
    
    // Check if it exists
    const registrations = await Registration.find();
    console.log('📊 Total registrations in DB:', registrations.length);
    console.log('📝 Registrations:', registrations);
    
    process.exit();
})
.catch(err => {
    console.error('❌ Error:', err);
});