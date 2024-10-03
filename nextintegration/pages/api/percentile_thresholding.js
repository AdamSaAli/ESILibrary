import path from 'path';
import { exec } from 'child_process';

export default function handler(req, res) {
    const { startDate, endDate, percentile } = req.body;
    console.log('Received parameters:', { startDate, endDate, percentile });
    if (!startDate || !endDate || percentile === undefined) {
        return res.status(400).json({ error: 'Start date, end date, and percentile are required.' });
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'percentile_map.py');
    const csvFilePath = path.join(process.cwd(), 'public', 'Tallinn40v3.csv');

    // Build the command to run the Python script with the provided arguments
    const command = `python "${scriptPath}" ${percentile} "${startDate}" "${endDate}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            return res.status(500).json({ error: 'Error generating map.' });
        }

        console.log(`Script output: ${stdout}`);
        res.status(200).json({ message: 'Map generated successfully.', output: stdout });
    });
}