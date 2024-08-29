import { PythonShell } from 'python-shell';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { percentile, startDate, endDate, methodology } = req.body;

        let scriptFilePath;
        let options;

        if (methodology === 'Percentile') {
            scriptFilePath = path.join(process.cwd(), 'scripts', 'percentile_map.py');
            console.log('in here')
            options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: [percentile, startDate, endDate]
            };
        } else if (methodology === 'Z-Score') {
            scriptFilePath = path.join(process.cwd(), 'scripts', 'generate_map.py');
            console.log('in here for z-score')
            options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: [startDate, endDate]
            };
        } else {
            return res.status(400).json({ error: 'Invalid methodology selected' });
        }

        console.log('Running script at path:', scriptFilePath);
        console.log('With options:', options);

        // Check if the script file exists
        if (!fs.existsSync(scriptFilePath)) {
            console.error('Script file does not exist at path:', scriptFilePath);
            return res.status(500).json({ error: 'Script file not found.' });
        }

        PythonShell.run(scriptFilePath, options, function (err, results) {
            if (err) {
                console.error('Error executing script:', err);
                return res.status(500).json({ error: 'Failed to generate maps.' });
            }

            console.log('Python script results:', results);

            if (results) {
                res.status(200).json({ data: results });
            } else {
                console.error('No results returned from script.');
                res.status(500).json({ error: 'No results returned from script.' });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}