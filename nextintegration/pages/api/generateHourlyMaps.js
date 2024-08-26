import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
    console.log('Received request:', req.method);

    if (req.method === 'POST') {
        const { selectedHours } = req.body;

        if (!selectedHours || selectedHours.length === 0) {
            console.log('No hours provided');
            return res.status(400).json({ error: 'No hours provided.' });
        }

        const hoursArg = selectedHours.join(',');
        const scriptPath = path.join(process.cwd(), 'scripts', 'generate_hourly_maps.py');
        
        const command = `python "${scriptPath}" "${hoursArg}"`;

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