import pandas as pd
import pydeck as pdk
import numpy as np
def generate_coldest_days_html(df):
    # Filter the DataFrame to include only clean NO2 gas data
    df = df[(df['clean_points_flag'] == True) & (df['Gas'] == 'NO2')]
    
    # Convert 'Temp' column to numeric
    df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')

    # Convert 'timestamp' column to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Drop rows with NaN values in 'Temp' column
    df.dropna(subset=['Temp'], inplace=True)

    # Extract 'Date' from 'timestamp'
    df['Date'] = df['timestamp'].dt.date
    
    # Calculate daily average temperatures
    daily_avg_temperatures = df.groupby('Date')['Temp'].mean()
    
    # Find the coldest 2 days
    userDays = int(input("Enter the amount of days: "))
    coldest_days = daily_avg_temperatures.nsmallest(userDays)
    
    # Calculate mean latitude and longitude for map centering
    
    
    # Create PyDeck map
    for date in coldest_days.index:

        group  = df[df['Date']==date].copy()

        group.drop(columns = ['Date'], inplace=True)
    # Set the view options for the map

        view_state = pdk.ViewState(
            latitude=group['Latitude'].mean(), #it was df before group
            longitude=group['Longitude'].mean(), #it was df before group
            zoom=11.5
        )

        # Define the layer

    # HIGHER ZOOM NUMBER EQUALS MORE ZOOM IN

        #group_dict = group.to_dict(orient='records') #added this

        layer = pdk.Layer(
            "HeatmapLayer",
            data=group, 
            get_position=['Longitude', 'Latitude'],
            aggregation='MEAN',
            get_weight="Temp",  # Use the temperature column as the weight for the heatmap
            radius_pixels=60,  # Adjust the radius to control the area covered by each point
            intensity=1,  # Adjust intensity for visual impact
            threshold=0.05, # Minimum threshold for rendering; lower values give a broader heat effect
           
            color_range=[
            [0, 128, 0],  # Blue, cooler
            [50, 205, 50],  # Light blue
            [255, 255, 0],  # Very light blue
            [255, 165, 0],  # Light red
            [255, 0, 0],# Red, hotter
            [178, 24, 43]
            #this last one was commented out by rama it dos add more color not previosly shown in the other photos
            ],
            opacity=0.6  # Adjust opacity for better visualization
        )

        # Create the deck.gl map
        r = pdk.Deck(
            layers=[layer],

            initial_view_state=view_state,
            map_provider='mapbox',
                # map_style='mapbox://styles/mapbox/standard'
            map_style = 'mapbox://styles/mapbox/streets-v12',
                # Using Mapbox satellite style
            api_keys={'mapbox':'pk.eyJ1IjoicmFtYWRpdHlhNTI0IiwiYSI6ImNrb3NwcTF5NjAzZTIyc252cm9scGhub2QifQ.IF_qMBaHLJeTKcyIVuiBBw'}  # Replace with your Mapbox API key
        )
        print("AWEDHIAs")
        output_file = f'tallaqdrqwdrwerinn_adam_{date}.html'




        r.to_html(output_file)

#df = pd.read_csv('Tallinn40v3.csv')
#generate_coldest_days_html(df)

def generate_hottest_days_html(df):
    # Filter the DataFrame to include only clean NO2 gas data
    df = df[(df['clean_points_flag'] == True) & (df['Gas'] == 'NO2')]
    
    # Convert 'Temp' column to numeric
    df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')

    # Convert 'timestamp' column to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Drop rows with NaN values in 'Temp' column
    df.dropna(subset=['Temp'], inplace=True)

    # Extract 'Date' from 'timestamp'
    df['Date'] = df['timestamp'].dt.date
    
    # Calculate daily average temperatures
    daily_avg_temperatures = df.groupby('Date')['Temp'].mean()
    
    # Find the coldest 2 days
    userDays = int(input("Enter the amount of days: "))
    hottest_days = daily_avg_temperatures.nlargest(userDays)
    
    # Calculate mean latitude and longitude for map centering
    
    
    # Create PyDeck map
    for date in hottest_days.index:

        group  = df[df['Date']==date].copy()

        group.drop(columns = ['Date'], inplace=True)
    # Set the view options for the map

        view_state = pdk.ViewState(
            latitude=group['Latitude'].mean(), #it was df before group
            longitude=group['Longitude'].mean(), #it was df before group
            zoom=11.5
        )

        # Define the layer

    # HIGHER ZOOM NUMBER EQUALS MORE ZOOM IN

        #group_dict = group.to_dict(orient='records') #added this

        layer = pdk.Layer(
            "HeatmapLayer",
            data=group, 
            get_position=['Longitude', 'Latitude'],
            aggregation='MEAN',
            get_weight="Temp",  # Use the temperature column as the weight for the heatmap
            radius_pixels=60,  # Adjust the radius to control the area covered by each point
            intensity=1,  # Adjust intensity for visual impact
            threshold=0.05,  # Minimum threshold for rendering; lower values give a broader heat effect
            color_range=[
            [0, 128, 0],  # Blue, cooler
            [50, 205, 50],  # Light blue
            [255, 255, 0],  # Very light blue
            [255, 165, 0],  # Light red
            [255, 0, 0],# Red, hotter
            [178, 24, 43]
            #this last one was commented out by rama it dos add more color not previosly shown in the other photos
            ],
            opacity=0.6  # Adjust opacity for better visualization
        )

        # Create the deck.gl map
        r = pdk.Deck(
            layers=[layer],

            initial_view_state=view_state,
            map_provider='mapbox',
                # map_style='mapbox://styles/mapbox/standard'
            map_style = 'mapbox://styles/mapbox/streets-v12',
                # Using Mapbox satellite style
            api_keys={'mapbox':'pk.eyJ1IjoicmFtYWRpdHlhNTI0IiwiYSI6ImNrb3NwcTF5NjAzZTIyc252cm9scGhub2QifQ.IF_qMBaHLJeTKcyIVuiBBw'}  # Replace with your Mapbox API key
        )
        print("AWEDHIAs")
        output_file = f'tallaqdrqwdrwerinn_adam_{date}.html'




        r.to_html(output_file)
df = pd.read_csv('Tallinn40v3.csv')
#generate_hottest_days_html(df)

def getHottestDaysText(df):
    df = df[(df['clean_points_flag'] == True) & (df['Gas'] == 'NO2')]
        
        # Convert 'Temp' column to numeric
    df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')

        # Convert 'timestamp' column to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Drop rows with NaN values in 'Temp' column
    df.dropna(subset=['Temp'], inplace=True)

        # Extract 'Date' from 'timestamp'
    df['Date'] = df['timestamp'].dt.date
        
        # Calculate daily average temperatures
    daily_avg_temperatures = df.groupby('Date')['Temp'].mean()
        
        
    userDays = int(input("Enter the amount of days: "))
    hottest_days = daily_avg_temperatures.nlargest(userDays)
    print(hottest_days)
    return
#getHottestDaysText(df)

def getColdestDaysText(df):
    df = df[(df['clean_points_flag'] == True) & (df['Gas'] == 'NO2')]
        
    # Convert 'Temp' column to numeric
    df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')

    # Convert 'timestamp' column to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
        
    # Drop rows with NaN values in 'Temp' column
    df.dropna(subset=['Temp'], inplace=True)

    # Extract 'Date' from 'timestamp'
    df['Date'] = df['timestamp'].dt.date
        
    # Calculate daily average temperatures
    daily_avg_temperatures = df.groupby('Date')['Temp'].mean()
        
        
    userDays = int(input("Enter the amount of days: "))
    coldest_days = daily_avg_temperatures.nsmallest(userDays)
    print(coldest_days)
    return
#getColdestDaysText(df)
def generate_all_days(df):
    # Filter the DataFrame to include only clean NO2 gas data

    df = df[(df['clean_points_flag'] == True) & (df['Gas'] == 'NO2')]
    
    # Convert 'Temp' column to numeric
    df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')

    # Convert 'timestamp' column to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Drop rows with NaN values in 'Temp' column
    df.dropna(subset=['Temp'], inplace=True)

    # Extract 'Date' from 'timestamp'
    df['Date'] = df['timestamp'].dt.date
    
    # Calculate daily average temperatures
    daily_avg_temperatures = df.groupby('Date')['Temp'].mean()
    
    # Find the coldest 2 days
    
    
    # Calculate mean latitude and longitude for map centering
    
    
    # Create PyDeck map
    for date in daily_avg_temperatures.index:

        group  = df[df['Date']==date].copy()

        group.drop(columns = ['Date'], inplace=True)
    # Set the view options for the map

        view_state = pdk.ViewState(
            latitude=group['Latitude'].mean(), #it was df before group
            longitude=group['Longitude'].mean(), #it was df before group
            zoom=11.5
        )

        # Define the layer

    # HIGHER ZOOM NUMBER EQUALS MORE ZOOM IN

        #group_dict = group.to_dict(orient='records') #added this

        layer = pdk.Layer(
            "HeatmapLayer",
            data=group, 
            get_position=['Longitude', 'Latitude'],
            aggregation='MEAN',
            get_weight="Temp",  # Use the temperature column as the weight for the heatmap
            radius_pixels=60,  # Adjust the radius to control the area covered by each point
            intensity=1,  # Adjust intensity for visual impact
            threshold=0.05,  # Minimum threshold for rendering; lower values give a broader heat effect
            color_range=[
            [0, 128, 0],  # Blue, cooler
            [50, 205, 50],  # Light blue
            [255, 255, 0],  # Very light blue
            [255, 165, 0],  # Light red
            [255, 0, 0],# Red, hotter
            [178, 24, 43]
            #this last one was commented out by rama it dos add more color not previosly shown in the other photos
            ],
            opacity=0.6  # Adjust opacity for better visualization
        )

        # Create the deck.gl map
        r = pdk.Deck(
            layers=[layer],

            initial_view_state=view_state,
            map_provider='mapbox',
                # map_style='mapbox://styles/mapbox/standard'
            map_style = 'mapbox://styles/mapbox/streets-v12',
                # Using Mapbox satellite style
            api_keys={'mapbox':'pk.eyJ1IjoicmFtYWRpdHlhNTI0IiwiYSI6ImNrb3NwcTF5NjAzZTIyc252cm9scGhub2QifQ.IF_qMBaHLJeTKcyIVuiBBw'}  # Replace with your Mapbox API key
        )
        print("AWEDHIAs")
        output_file = f'tallaqdrqwdrwerinn_adam_{date}.html'




        r.to_html(output_file)
df =  pd.read_csv('Tallinn40v3.csv')
#generate_all_days(df)

#maybe we can add a prompt in asking the user which Gas they would like to measure?

def testing(df):
    print("IN TESTING")
    df = df[(df['clean_points_flag'] == True) & (df['Gas'] == 'NO2')]

# Convert 'Temp' column to numeric, coerce errors to NaN
    df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')

# Drop rows with NaN values in 'Temp' column
    df.dropna(subset=['Temp'], inplace=True)
    df['timestamp'] = pd.to_datetime(df['timestamp'])

# Define the specific hours you want to include
    specific_hours = [9,10,11,12,13,14,15,16,17]  # Example: 8 AM, 12 PM, 4 PM, 8 PM

    # Filter the DataFrame for the specific hours
    filtered_df = df[df['timestamp'].dt.hour.isin(specific_hours)]

    # Group by hour and calculate the mean longitude, latitude, and 99th percentile temperature across all days
    hourly_data_combined = filtered_df.groupby('Hour').agg({'Longitude': 'mean', 'Latitude': 'mean', 'Temp': lambda x: x.quantile(0.99)}).reset_index()

    # Prepare data for Pydeck visualization
    layer = pdk.Layer(
        'ScatterplotLayer',
        hourly_data_combined,
        get_position='[Longitude, Latitude]',
        get_radius=30,  # Adjust as needed
        get_fill_color='[255, 0, 0]',
        pickable=True,
        auto_highlight=True,
    )

    # Set the map view
    view_state = pdk.ViewState(
        latitude=hourly_data_combined['Latitude'].mean(),
        longitude=hourly_data_combined['Longitude'].mean(),
        zoom=10,
    )

    # Create the deck
    r = pdk.Deck(layers=[layer], 
                 initial_view_state=view_state,
                map_provider='mapbox',
                map_style='mapbox://styles/mapbox/streets-v12',
                api_keys={'mapbox': 'pk.eyJ1IjoicmFtYWRpdHlhNTI0IiwiYSI6ImNrb3NwcTF5NjAzZTIyc252cm9scGhub2QifQ.IF_qMBaHLJeTKcyIVuiBBw'}
                 )
    output_file = f'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.html'
    r.to_html(output_file)
df =  pd.read_csv('Tallinn40v3.csv')
testing(df)