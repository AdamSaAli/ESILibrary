import pandas as pd
import pydeck as pdk
import numpy as np
df = pd.read_csv('Tallinn40v3.csv', usecols=['Latitude', 'Longitude', 'timestamp', 'Temp', 'Gas', 'clean_points_flag','Hour'])

# Filter the DataFrame to include only clean points with gas NO2
df = df[(df['clean_points_flag'] == True) & (df['Gas'] == 'NO2')]

# Convert 'Temp' column to numeric, coerce errors to NaN
df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')

# Drop rows with NaN values in 'Temp' column
df.dropna(subset=['Temp'], inplace=True)

# Calculate the 95th percentile temperature for each hour
percentiles_by_hour = df.groupby('Hour')['Temp'].quantile(0.99)
print(percentiles_by_hour)
conc = pd.DataFrame()

# Iterate through each hour from 9 AM to 5 PM
for hour in range(10, 16):
    # Get the 95th percentile temperature for this hour
    percentile_95 = percentiles_by_hour.get(hour)
    print(percentile_95)
    if percentile_95 is not None:  # Check if data exists for this hour
        # Filter the DataFrame to include only data for the current hour above the 95th percentile
        df_hour_top_5 = df[(df['Hour'] == hour) & (df['Temp'] >= percentile_95)]
        conc = pd.concat([conc,df_hour_top_5])
        # Group data by date
        # grouped_data = df_hour_top_5.groupby(df_hour_top_5['timestamp'].dt.date)
        
        # Calculate the mean latitude and longitude for the hour
mean_latitude = conc['Latitude'].mean()
mean_longitude = conc['Longitude'].mean()
        
        # Set the view state for the map
view_state = pdk.ViewState(
            latitude=mean_latitude,
            longitude=mean_longitude,
            zoom=11.5
        )
        # Define the scatterplot layer for the hour
layer = pdk.Layer(
            'ScatterplotLayer',
            data=conc,
            get_position=['Longitude', 'Latitude'],
            get_color=[0, 0, 0],
            get_radius=50,  # Adjust radius size to your preference
        )
        
        # Create the PyDeck map
r = pdk.Deck(
            layers=[layer],
            initial_view_state=view_state,
            map_provider='mapbox',
            map_style='mapbox://styles/mapbox/streets-v12',
            api_keys={'mapbox': 'pk.eyJ1IjoicmFtYWRpdHlhNTI0IiwiYSI6ImNrb3NwcTF5NjAzZTIyc252cm9scGhub2QifQ.IF_qMBaHLJeTKcyIVuiBBw'}  # Replace with your Mapbox API key
        )

        # Save the map to an HTML file
# output_file = f'tallinn_adam_{hour}.html'
output_file = f'tallinn_combo.html'
r.to_html(output_file)