import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
    console.log('Received request:', req.method);

    if (req.method === 'POST') {
        const { selectedHours, percentile, startDate, endDate } = req.body;
        console.log(startDate,endDate,'in percentile hourly',selectedHours)
        // Check if all necessary arguments are provided
        if (!selectedHours || selectedHours.length === 0) {
            console.log('No hours provided');
            return res.status(400).json({ error: 'No hours provided.' });
        }

        if (!percentile || isNaN(percentile) || percentile < 0 || percentile > 100) {
            console.log('Invalid percentile value');
            return res.status(400).json({ error: 'Invalid percentile value. Please provide a value between 0 and 100.' });
        }

        if (!startDate || !endDate) {
            console.log('Invalid date range');
            return res.status(400).json({ error: 'Invalid date range. Please provide both start and end dates.' });
        }

        // Prepare the command with all required arguments
        const scriptPath = path.join(process.cwd(), 'scripts', 'percentile_hourly_maps.py');

        // Prepare the command arguments array
        const args = [percentile, startDate, endDate, ...selectedHours];

        // Create the full command with the Python executable and script path
        const command = `python "${scriptPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;

        console.log('Running script with command:', command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing script: ${stderr}`);
                return res.status(500).json({ error: `Error executing script: ${stderr}` });
            }

            console.log('Script output:', stdout);
            return res.status(200).json({ message: 'Maps generated successfully.', output: stdout });
        });
    } else {
        console.log('Invalid request method:', req.method);
        res.status(405).json({ message: 'Method not allowed' });
    }
}
