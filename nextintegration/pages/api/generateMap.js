import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start and end dates are required.' });
    }

    const dateRange = `${startDate} to ${endDate}`;
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_map.py');
    const csvFilePath = path.join(process.cwd(), 'public', 'Tallinn40v3.csv');

    const command = `python "${scriptPath}" "${csvFilePath}" "${dateRange}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            return res.status(500).json({ error: 'Error generating map.' });
        }

        console.log(`Script output: ${stdout}`);
        res.status(200).json({ message: 'Map generated successfully.' });
    });
}