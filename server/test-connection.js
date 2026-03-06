const net = require('net');

// One of the shard addresses we found earlier via nslookup
const host = 'ac-3mw4fku-shard-00-00.dbffjkc.mongodb.net';
const port = 27017;

console.log(`Testing TCP connectivity to ${host}:${port}...`);
console.log('If this times out or fails, your NETWORK is blocking MongoDB.');

const socket = new net.Socket();

socket.setTimeout(5000); // 5 second timeout

socket.on('connect', () => {
    console.log('✅ SUCCESS: TCP Connection established!');
    console.log('Your Internet allows access to MongoDB.');
    socket.destroy();
});

socket.on('timeout', () => {
    console.log('❌ TIMEOUT: Could not connect within 5 seconds.');
    console.log('---------------------------------------------------------');
    console.log('YOUR NETWORK IS BLOCKING PORT 27017.');
    console.log('You CANNOT use this network for MongoDB Atlas.');
    console.log('Please switch to a Mobile Hotspot or different WiFi.');
    console.log('---------------------------------------------------------');
    socket.destroy();
});

socket.on('error', (err) => {
    console.log(`❌ ERROR: ${err.message}`);
    console.log('Connection failed.');
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        console.log('---------------------------------------------------------');
        console.log('YOUR NETWORK IS BLOCKING PORT 27017.');
        console.log('Please switch to a Mobile Hotspot.');
        console.log('---------------------------------------------------------');
    }
    socket.destroy();
});

socket.connect(port, host);
