import { PythonShell } from 'python-shell';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { percentile } = req.body;

        // Define options for PythonShell
        let options = {
            mode: 'text',
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: 'path_to_your_python_script', // Path to your Python script
            args: [percentile] // Pass the percentile as an argument
        };

        // Run the Python script
        PythonShell.run('your_python_script.py', options, function (err, results) {
            if (err) res.status(500).json({ error: err.message });
            // results is an array of messages collected during execution
            res.status(200).json({ data: results });
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}