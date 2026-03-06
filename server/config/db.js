const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.code === 'ECONNREFUSED' || error.message.includes('querySrv')) {
            console.error('---------------------------------------------------------');
            console.error('CONNECTION ERROR: Likely a DNS or Firewall issue.');
            console.error('1. Whitelist your IP in MongoDB Atlas (Network Access).');
            console.error('2. Try using a different network (e.g., mobile hotspot).');
            console.error('3. Change your DNS to Google DNS (8.8.8.8).');
            console.error('---------------------------------------------------------');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
