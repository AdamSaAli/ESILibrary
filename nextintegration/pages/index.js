import React from 'react';

import HotSpotLayout from './HotSpotLayout'; // Adjust the path based on where you placed HotSpotLayout.js
import PercentileThresholding from '../components/PercentileThresholding';

const HotspotPage = () => {
    return (
        <div>
            {/* Include the PercentileThresholding component here */}
            
            {/* Then include the HotSpotLayout component */}
            <HotSpotLayout />
        </div>
    );
};

export default HotspotPage;