try {
    const { execSync } = require('child_process');
    console.log('Searching for processes on port 5000...');
    const output = execSync('netstat -ano | findstr :5000').toString();
    const pids = new Set();
    output.split('\n').forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && !isNaN(pid)) {
                pids.add(pid);
            }
        }
    });

    if (pids.size === 0) {
        console.log('No processes found on port 5000.');
    } else {
        pids.forEach(pid => {
            console.log(`Killing process ${pid}...`);
            try {
                execSync(`taskkill /F /PID ${pid}`);
                console.log(`Successfully killed ${pid}`);
            } catch (e) {
                console.error(`Failed to kill ${pid}: ${e.message}`);
            }
        });
    }
} catch (error) {
    if (error.status === 1) {
        console.log('Port 5000 is likely already free.');
    } else {
        console.error(`Error: ${error.message}`);
    }
}
