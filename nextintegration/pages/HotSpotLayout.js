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
        const endpoint = 
            selectedMethodology === 'Percentile' ? '/api/percentile_thresholding' : 
            selectedMethodology === 'Local Moran\'s I' ? '/api/local_morans' :
            '/api/generateMap'; // Default to Z-Score

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
        const endpoint = 
            selectedMethodology === 'Percentile' ? '/api/percentile_hourly_map' :
            selectedMethodology === 'Local Moran\'s I' ? '/api/local_morans_hourly' :
            '/api/generateHourlyMaps'; // Default to Z-Score

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
        <div className="">
            <div className="">
                <h2 className="text-center underline font-bold pb-5">Hot Spot Detection</h2>
                <form onSubmit={handleSubmitIntervalMaps}>
                    <div className="controls">
                        <div>
                            <label >Select the dates you would like to view:</label>
                            <br></br>
                            <label className='font-bold'>Start: </label>
                            <input type="date" className='border-2 border-black' placeholder="Start Date" onChange={(e) => setStartDate(e.target.value)} />
                            <label className='font-bold'>End: </label>
                            <input type="date" className='border-2 border-black' placeholder="End Date" onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                        <div>
                            <label>Select The Methodology you would like (Z-Score, Percentile, Local Moran's I): </label>
                            
                            <select className='border-2 border-black' onChange={handleMethodologyChange}>
                                <option value="Z-Score">Z-Score</option>
                                <option value="Percentile">Percentile</option>
                                <option value="Local Moran's I">Local Moran's I</option>
                            </select>
                        </div>
                        {selectedMethodology === 'Percentile' && (
                            <div>
                                <label>Enter Percentile (0-100): </label>
                                <input
                                    type="number"
                                    value={percentile}
                                    onChange={(e) => setPercentile(e.target.value)}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="Enter percentile"
                                    className='w-part p-2 border border-gray-300 rounded text-base'
                                />
                            </div>
                        )}
                    </div>
                    <button type="submit" className='bg-blue-500 hover:bg-blue-700 text-white hover:font-bold py-2 px-4 rounded-full'>Generate Interval Maps</button>
                    {errorMessage && <p className='font-bold text-red-500'>{errorMessage}</p>} 
                </form>
            </div>

            {intervalMapsVisible && (
                <>
                    <div className="methodology">
                        <h3 className='text-center  '>Methodology: {selectedMethodology}</h3>
                    </div>

                    <div className="maps">
                        <div className="map-container">
                            <h4>Time between 12-6 am</h4>
                            <iframe
                                key={refreshKey}
                                className="map-placeholder"
                                src="/12am-6am_hotspot_map.html"
                                title="12-6am Hotspot Map"
                            />
                        </div>

                        <div className="map-container">
                            <h4>Time between 6-12 pm</h4>
                            <iframe
                                key={refreshKey}
                                className="map-placeholder"
                                src="/6am-12pm_hotspot_map.html"
                                title="6-12pm Hotspot Map"
                            />
                        </div>

                        <div className="map-container">
                            <h4>Time between 12-6 pm</h4>
                            <iframe
                                key={refreshKey}
                                className="map-placeholder"
                                src="/12pm-6pm_hotspot_map.html"
                                title="12-6pm Hotspot Map"
                            />
                        </div>

                        <div className="map-container">
                            <h4>Time between 6-12 am</h4>
                            <iframe
                                key={refreshKey}
                                className="map-placeholder"
                                src="/6pm-12am_hotspot_map.html"
                                title="6-12am Hotspot Map"
                            />
                        </div>
                    </div>

                    <div className="hour-selector">
                        <h4 className='text-center underline font-bold'>Select specific hours to map</h4>
                        <div className="hours">
                            {Array.from({ length: 24 }).map((_, index) => (
                                <button className='bg-white hover:bg-blue-500 text-black-700 font-semibold hover:text-white py-2 px-4 border border-black hover:border-transparent m-px rounded-md' key={index} type="button" onClick={() => handleHourClick(index + 1)}>
                                    {selectedHours.includes(index + 1) ? `Hour ${index + 1} (selected)` : `Hour ${index + 1}`}
                                </button>
                            ))}
                        </div>
                        <div className="selected-hours">
                            <p>Selected Hours: {selectedHours.join(', ')}</p>
                        </div>
                        {errorMessage && <p className='font-bold text-red-500'>{errorMessage}</p>} 
                        <button type="button" onClick={handleSubmitHourlyMaps} className='bg-blue-500 p-3 hover:bg-blue-700 rounded-full hover:font-bold text-white'>Generate Hourly Maps</button>
                    </div>
                </>
            )}

            {hourlyMapsVisible && (
                <div className="final-map-container">
                    <iframe
                        key={refreshKey}
                        className="final-map-placeholder"
                        src={selectedMethodology === 'Percentile'
                            ? `/hour_${selectedHours.join('_')}_percentile_hotspot_map.html`
                            : selectedMethodology === 'Local Moran\'s I'
                            ? `/hour_${selectedHours.join('_')}_local_morans_hotspot_map.html`
                            : `/hour_${selectedHours.join('_')}_hotspot_map.html`
                        }
                        title="Final Hotspot Map"
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
