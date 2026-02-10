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

    // ✅ NEW: slider UI only (does nothing)
    const [hourRange, setHourRange] = useState([0, 23]);

    const handleSubmitIntervalMaps = async (e) => {
        e.preventDefault();

        if (
            selectedMethodology === 'Percentile' &&
            (percentile === '' || isNaN(percentile) || percentile < 0 || percentile > 100)
        ) {
            setErrorMessage('Please enter a valid percentile between 0 and 100.');
            return;
        }

        if (!startDate || !endDate) {
            setErrorMessage('Please select a valid date range.');
            return;
        }

        setErrorMessage('');

        const endpoint =
            selectedMethodology === 'Percentile'
                ? '/api/percentile_thresholding'
                : selectedMethodology === "Local Moran's I"
                ? '/api/local_morans'
                : '/api/generateMap';

        try {
            const intervalResponse = await axios.post(endpoint, {
                startDate,
                endDate,
                selectedMethodology,
                percentile: selectedMethodology === 'Percentile' ? Number(percentile) : null,
            });

            if (intervalResponse.status === 200) {
                setIntervalMapsVisible(true);
                setRefreshKey(prevKey => prevKey + 1);
            }
        } catch (error) {
            console.error(error);
            setErrorMessage('An error occurred while generating interval maps.');
        }
    };

    const handleMethodologyChange = (e) => {
        setSelectedMethodology(e.target.value);
        setIntervalMapsVisible(false);
        setHourlyMapsVisible(false);
    };

    return (
        <div>
            <h2 className="text-center underline font-bold pb-5">
                Hot Spot Detection
            </h2>

            {/* ================= FORM ================= */}
            <form onSubmit={handleSubmitIntervalMaps}>
                <div className="controls">
                    <div>
                        <label>Select the dates you would like to view:</label><br />
                        <label className="font-bold">Start: </label>
                        <input
                            type="date"
                            className="border-2 border-black"
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <label className="font-bold">End: </label>
                        <input
                            type="date"
                            className="border-2 border-black"
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label>
                            Select The Methodology you would like (Z-Score, Percentile, Local Moran's I):
                        </label>
                        <select
                            className="border-2 border-black"
                            onChange={handleMethodologyChange}
                        >
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
                                className="border p-2"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
                >
                    Generate Interval Maps
                </button>

                {errorMessage && (
                    <p className="font-bold text-red-500">{errorMessage}</p>
                )}
            </form>

            {/* ================= OVERVIEW MAP (NEW) ================= */}
            {intervalMapsVisible && (
                <div className="flex justify-center mt-10">
                    <div className="w-full max-w-5xl">
                        <h3 className="text-center font-bold mb-4">
                            Overview Map (All Data)
                        </h3>

                        <iframe
                            className="w-full h-[500px] border"
                            src="/overview_hotspot_map.html"
                            title="Overview Hotspot Map"
                        />

                        {/* SLIDER (UI ONLY) */}
                        <div className="mt-6 px-4">
                            <p className="text-center font-bold">
                                Hour Range: {hourRange[0]} → {hourRange[1]}
                            </p>

                            <Slider
                                range
                                min={0}
                                max={23}
                                step={1}
                                value={hourRange}
                                onChange={setHourRange}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ================= INTERVAL MAPS (UNCHANGED) ================= */}
            {intervalMapsVisible && (
                <div className="maps">
                    <div className="map-container">
                        <h4>Time between 12–6 am</h4>
                        <iframe key={refreshKey} src="/12am-6am_hotspot_map.html" />
                    </div>

                    <div className="map-container">
                        <h4>Time between 6–12 pm</h4>
                        <iframe key={refreshKey} src="/6am-12pm_hotspot_map.html" />
                    </div>

                    <div className="map-container">
                        <h4>Time between 12–6 pm</h4>
                        <iframe key={refreshKey} src="/12pm-6pm_hotspot_map.html" />
                    </div>

                    <div className="map-container">
                        <h4>Time between 6–12 am</h4>
                        <iframe key={refreshKey} src="/6pm-12am_hotspot_map.html" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotSpotLayout;
