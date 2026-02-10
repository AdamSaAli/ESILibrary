import React, { useState } from 'react';
import axios from 'axios';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const HotSpotLayout = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedMethodology, setSelectedMethodology] = useState('Z-Score');
    const [selectedHours, setSelectedHours] = useState([]);
    const [intervalMapsVisible, setIntervalMapsVisible] = useState(false);
    const [hourlyMapsVisible, setHourlyMapsVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [percentile, setPercentile] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    // NEW: Hour range slider (0–23)
    const [hourRange, setHourRange] = useState([0, 23]);

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
            '/api/generateMap';

        try {
            const intervalResponse = await axios.post(endpoint, {
                startDate,
                endDate,
                selectedMethodology,
                percentile: selectedMethodology === 'Percentile' ? Number(percentile) : null,

                // NEW: pass hour range (optional if your backend uses it)
                hourStart: hourRange[0],
                hourEnd: hourRange[1],
            });

            if (intervalResponse.status === 200) {
                setIntervalMapsVisible(true);
                setRefreshKey(prevKey => prevKey + 1);
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

        const endpoint =
            selectedMethodology === 'Percentile' ? '/api/percentile_hourly_map' :
            selectedMethodology === 'Local Moran\'s I' ? '/api/local_morans_hourly' :
            '/api/generateHourlyMaps';

        try {
            const hourlyResponse = await axios.post(endpoint, {
                selectedHours,
                percentile: selectedMethodology === 'Percentile' ? Number(percentile) : null,
                startDate,
                endDate
            });

            if (hourlyResponse.status === 200) {
                setHourlyMapsVisible(true);
                setRefreshKey(prevKey => prevKey + 1);
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
                            <label>Select the dates you would like to view:</label>
                            <br />
                            <label className='font-bold'>Start: </label>
                            <input
                                type="date"
                                className='border-2 border-black'
                                placeholder="Start Date"
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <label className='font-bold'>End: </label>
                            <input
                                type="date"
                                className='border-2 border-black'
                                placeholder="End Date"
                                onChange={(e) => setEndDate(e.target.value)}
                            />
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

                    <button type="submit" className='bg-blue-500 hover:bg-blue-700 text-white hover:font-bold py-2 px-4 rounded-full'>
                        Generate Interval Maps
                    </button>

                    {errorMessage && <p className='font-bold text-red-500'>{errorMessage}</p>}
                </form>
            </div>

            {/* OVERVIEW MAP (TOP) + SLIDER UNDER IT */}
            {intervalMapsVisible && (
                <div className="flex justify-center mt-8">
                    <div className="w-full max-w-5xl">
                        <h3 className="text-center font-bold mb-4">Overall Hot Spot Overview</h3>

                        <iframe
                            key={`overview-${refreshKey}`}
                            className="w-full h-[500px] border rounded-lg shadow"
                            src="/overview_hotspot_map.html"
                            title="Overall Hotspot Map"
                        />

                        {/* Slider goes directly under the overview map */}
                        <div className="mt-6 px-4">
                            <label className="font-bold block mb-2 text-center">
                                Hour Range: {hourRange[0]} → {hourRange[1]}
                            </label>

                            <Slider
                                range
                                min={0}
                                max={23}
                                step={1}
                                value={hourRange}
                                onChange={setHourRange}
                                marks={{
                                    0: '0',
                                    6: '6',
                                    12: '12',
                                    18: '18',
                                    23: '23',
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {intervalMapsVisible && (
                <>
                    <div className="methodology">
                        <h3 className='text-center'>Methodology: {selectedMethodology}</h3>
                    </div>

                    <div className="maps">
                        <div className="map-container">
                            <h4>Time between 12-6 am</h4>
                            <iframe
                                key={`12am-6am-${refreshKey}`}
                                className="map-placeholder"
                                src="/12am-6am_hotspot_map.html"
                                title="12-6am Hotspot Map"
                            />
                        </div>

                        <div className="map-container">
                            <h4>Time between 6-12 pm</h4>
                            <iframe
                                key={`6am-12pm-${refreshKey}`}
                                className="map-placeholder"
                                src="/6am-12pm_hotspot_map.html"
                                title="6-12pm Hotspot Map"
                            />
                        </div>

                        <div className="map-container">
                            <h4>Time between 12-6 pm</h4>
                            <iframe
                                key={`12pm-6pm-${refreshKey}`}
                                className="map-placeholder"
                                src="/12pm-6pm_hotspot_map.html"
                                title="12-6pm Hotspot Map"
                            />
                        </div>

                        <div className="map-container">
                            <h4>Time between 6-12 am</h4>
                            <iframe
                                key={`6pm-12am-${refreshKey}`}
                                className="map-placeholder"
                                src="/6pm-12am_hotspot_map.html"
                                title="6-12am Hotspot Map"
                            />
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default HotSpotLayout;
