import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HotSpotLayout = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMethodology, setSelectedMethodology] = useState('Z-Score');
    const [selectedHours, setSelectedHours] = useState([]);
    const [intervalMapsVisible, setIntervalMapsVisible] = useState(false);
    const [hourlyMapsVisible, setHourlyMapsVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // State to track error messages
    const [percentile, setPercentile] = useState(''); // State for percentile input
    const [refreshKey, setRefreshKey] = useState(0); // Key to force refresh of iframes

    const handleHourClick = (hour) => {
        setSelectedHours((prev) => {
            if (prev.includes(hour)) {
                return prev.filter(h => h !== hour);
            } else {
                return [...prev, hour];
            }
        });
    };

    const handleSubmitIntervalMaps = async (e) => {
        e.preventDefault();

        if (selectedMethodology === 'Percentile' && (percentile === '' || isNaN(percentile) || percentile < 0 || percentile > 100)) {
            setErrorMessage('Please enter a valid percentile between 0 and 100.');
            return;
        }

        if (!startDate || !endDate) {
            setErrorMessage('Please select a valid date range.');
            return;
        }

        setErrorMessage('');
        const endpoint = selectedMethodology === 'Percentile' ? '/api/percentile_thresholding' : '/api/generateMap';

        try {
            const intervalResponse = await axios.post(endpoint, {
                startDate,
                endDate,
                selectedMethodology,
                percentile: selectedMethodology === 'Percentile' ? Number(percentile) : null,
            });

            if (intervalResponse.status === 200) {
                setIntervalMapsVisible(true);
                setRefreshKey(prevKey => prevKey + 1); // Force refresh of maps
                console.log('Interval maps generated successfully');
            }
        } catch (error) {
            console.error('Error generating interval maps:', error);
            setErrorMessage('An error occurred while generating interval maps.');
        }
    };

    const handleSubmitHourlyMaps = async (e) => {
        e.preventDefault();

        if (selectedHours.length === 0) {
            setErrorMessage('Must select hours to generate a map');
            setHourlyMapsVisible(false);
            return;
        }

        setErrorMessage('');

        // Determine the correct endpoint for hourly maps based on selected methodology
        const endpoint = selectedMethodology === 'Percentile' ? '/api/percentile_hourly_map' : '/api/generateHourlyMaps';

        try {
            const hourlyResponse = await axios.post(endpoint, {
                selectedHours,
                percentile: selectedMethodology === 'Percentile' ? Number(percentile) : null,
                startDate,
                endDate
            });

            if (hourlyResponse.status === 200) {
                setHourlyMapsVisible(true);
                setRefreshKey(prevKey => prevKey + 1); // Force refresh of maps
                console.log('Hourly maps generated successfully');
            }
        } catch (error) {
            console.error('Error generating hourly maps:', error);
            setErrorMessage('An error occurred while generating hourly maps.');
        }
    };

    const handleMethodologyChange = (e) => {
        setSelectedMethodology(e.target.value);
        setIntervalMapsVisible(false);
        setHourlyMapsVisible(false);
    };

    return (
        <div className="container">
            <div className="header">
                <h2>HotSpot Detection Methods</h2>
                <form onSubmit={handleSubmitIntervalMaps}>
                    <div className="controls">
                        <div>
                            <label>Select the dates you would like to view</label>
                            <input type="date" placeholder="Start Date" onChange={(e) => setStartDate(e.target.value)} />
                            <input type="date" placeholder="End Date" onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div>
                            <label>Select The Methodology you would like (Z-Score, Percentile, etc.)</label>
                            <select onChange={handleMethodologyChange}>
                                <option value="Z-Score">Z-Score</option>
                                <option value="Percentile">Percentile</option>
                            </select>
                        </div>
                        {selectedMethodology === 'Percentile' && (
                            <div>
                                <label>Enter Percentile (0-100)</label>
                                <input
                                    type="number"
                                    value={percentile}
                                    onChange={(e) => setPercentile(e.target.value)}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="Enter percentile"
                                />
                            </div>
                        )}
                    </div>
                    <button type="submit">Generate Interval Maps</button>
                </form>
            </div>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {intervalMapsVisible && (
                <>
                    <div className="methodology">
                        <h3>Methodology: {selectedMethodology}</h3>
                    </div>

                    <div className="maps">
                        {/* Display 4 maps for different time intervals */}
                        <div>
                            <h4>Time between 12-6 am</h4>
                            <iframe
                                key={refreshKey}
                                className="map-placeholder"
                                src="/12am-6am_hotspot_map.html"
                                title="12-6am Hotspot Map"
                                width="100%"
                                height="150px"
                                style={{ border: "none" }}
                            />
                        </div>
                        <div>
                            <h4>Time between 6-12 pm</h4>
                            <iframe
                                key={refreshKey}
                                className="map-placeholder"
                                src="/6am-12pm_hotspot_map.html"
                                title="6-12pm Hotspot Map"
                                width="100%"
                                height="150px"
                                style={{ border: "none" }}
                            />
                        </div>
                        <div>
                            <h4>Time between 12-6 pm</h4>
                            <iframe
                                key={refreshKey}
                                className="map-placeholder"
                                src="/12pm-6pm_hotspot_map.html"
                                title="12-6pm Hotspot Map"
                                width="100%"
                                height="150px"
                                style={{ border: "none" }}
                            />
                        </div>
                        <div>
                            <h4>Time between 6-12 am</h4>
                            <iframe
                                key={refreshKey}
                                className="map-placeholder"
                                src="/6pm-12am_hotspot_map.html"
                                title="6-12am Hotspot Map"
                                width="100%"
                                height="150px"
                                style={{ border: "none" }}
                            />
                        </div>
                    </div>

                    <div className="hour-selector">
                        <h4>Select specific hours to map</h4>
                        <div className="hours">
                            {Array.from({ length: 24 }).map((_, index) => (
                                <button key={index} type="button" onClick={() => handleHourClick(index + 1)}>
                                    {selectedHours.includes(index + 1) ? `Hour ${index + 1} (selected)` : `Hour ${index + 1}`}
                                </button>
                            ))}
                        </div>
                        <div className="selected-hours">
                            <p>Selected Hours: {selectedHours.join(', ')}</p>
                        </div>
                        <button type="button" onClick={handleSubmitHourlyMaps}>Generate Hourly Maps</button>
                    </div>
                </>
            )}

            {hourlyMapsVisible && (
                <div className="final-map">
                    <iframe
                        key={refreshKey}
                        className="map-placeholder"
                        src={selectedMethodology === 'Percentile' ? `/hour_${selectedHours.join('_')}_percentile_hotspot_map.html` : `/hour_${selectedHours.join('_')}_hotspot_map.html`}
                        title="Final Hotspot Map"
                        width="100%"
                        height="300px"
                        style={{ border: "none" }}
                        onError={(e) => {
                            e.target.src = '/hotspot_map.html'; // Fallback to default map if specific map is not found
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default HotSpotLayout;
