import { useState } from 'react';

const PercentileThresholding = () => {
    const [percentile, setPercentile] = useState('');
    const [error, setError] = useState('');

    const handleThresholding = async () => {
        if (percentile === '' || isNaN(percentile) || percentile < 0 || percentile > 100) {
            setError('Please enter a valid percentile between 0 and 100.');
            return;
        }
        
        setError(''); // Clear any previous errors

        try {
            const response = await fetch('/api/percentile_thresholding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ percentile: Number(percentile) }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Thresholding complete:', result.data);
                // Handle the result, e.g., update the UI or display the generated maps
            } else {
                console.error('Error during thresholding:', result.error);
            }
        } catch (error) {
            console.error('Request failed:', error);
        }
    };

    return (
        <div>
            <input
                type="number"
                value={percentile}
                onChange={(e) => setPercentile(e.target.value)}
                min="0"
                max="100"
                step="0.1"
                placeholder="Enter percentile"
            />
            <button onClick={handleThresholding}>Apply Percentile Thresholding</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PercentileThresholding;