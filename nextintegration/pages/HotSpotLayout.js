import React, { useState, useEffect } from 'react';
import axios from 'axios';
const HotSpotLayout = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMethodology, setSelectedMethodology] = useState('Z-Score');
    const [selectedHours, setSelectedHours] = useState([]);
    const [intervalMapsVisible, setIntervalMapsVisible] = useState(false);
    const [hourlyMapsVisible, setHourlyMapsVisible] = useState(false);
    const [finalMapSrc, setFinalMapSrc] = useState(''); // Track the source of the final map
    const [errorMessage, setErrorMessage] = useState(''); // State to track error messages

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

        // Generate the interval maps
        try {
            const intervalResponse = await axios.post('/api/generateMap', {
                startDate,
                endDate,
                selectedMethodology,
            });

            if (intervalResponse.status === 200) {
                setIntervalMapsVisible(true);
                console.log('Interval maps generated successfully');
            }
        } catch (error) {
            console.error('Error generating interval maps:', error);
        }
    };

    const handleSubmitHourlyMaps = async (e) => {
        e.preventDefault();

        // Check if any hours are selected
        if (selectedHours.length === 0) {
            setErrorMessage('Must select hours to generate a map');
            setHourlyMapsVisible(false); // Hide the map if no hours are selected
            return;
        }

        // Clear any previous error messages
        setErrorMessage('');

        // Generate the hourly maps if hours are selected
        try {
            const hourlyResponse = await axios.post('/api/generateHourlyMaps', {
                selectedHours,
            });

            if (hourlyResponse.status === 200) {
                // Update the map source to force the iframe to reload the new map
                setFinalMapSrc(`/hour_${selectedHours.join('_')}_hotspot_map.html?timestamp=${new Date().getTime()}`);
                setHourlyMapsVisible(true);
                console.log('Hourly maps generated successfully');
            }
        } catch (error) {
            console.error('Error generating hourly maps:', error);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h2>HotSpot Detection methods</h2>
                <form onSubmit={handleSubmitIntervalMaps}>
                    <div className="controls">
                        <div>
                            <label>Select the dates you would like to view</label>
                            <input type="date" placeholder="Start Date" onChange={(e) => setStartDate(e.target.value)} />
                            <input type="date" placeholder="End Date" onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div>
                            <label>Select The Methodology you would like (Z-Score, Percentile, etc.)</label>
                            <select onChange={(e) => setSelectedMethodology(e.target.value)}>
                                <option>Z-Score</option>
                                <option>Percentile</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit">Generate Interval Maps</button>
                </form>
            </div>

            {intervalMapsVisible && (
                <>
                    <div className="methodology">
                        <h3>Methodology: {selectedMethodology}</h3>
                    </div>

                    <div className="maps">
                        <div>
                            <h4>Time between 12-6 am</h4>
                            <iframe
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
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </div>
                </>
            )}

            {hourlyMapsVisible && (
                <div className="final-map">
                    <iframe
                        className="map-placeholder"
                        src={finalMapSrc}
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