import { useState } from 'react';

const PercentileThresholding = () => {
    const [percentile, setPercentile] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [mapUrls, setMapUrls] = useState([]);

    const handleThresholding = async () => {
        if (percentile === '' || isNaN(percentile) || percentile < 0 || percentile > 100) {
            setError('Please enter a valid percentile between 0 and 100.');
            return;
        }

        if (!startDate || !endDate) {
            setError('Please select a valid date range.');
            return;
        }

        setError(''); // Clear any previous errors

        try {
            const response = await fetch('/api/percentile_thresholding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ percentile: Number(percentile), startDate, endDate }),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Thresholding complete:', result.data);
                setMapUrls(result.data); // Assuming result.data contains the list of map URLs
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
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
            />
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
            />
            <button onClick={handleThresholding}>Apply Percentile Thresholding</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div>
                {mapUrls.length > 0 && mapUrls.map((url, index) => (
                    <div key={index}>
                        <h3>Map {index + 1}</h3>
                        <iframe
                            src={url}
                            width="100%"
                            height="500px"
                           
                        ></iframe>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PercentileThresholding;