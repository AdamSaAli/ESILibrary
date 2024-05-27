import pandas as pd
import pydeck as pdk

# Load your CSV file
df = pd.read_csv('Tallinn40v3.csv',usecols=['Latitude','Longitude','timestamp','RecDate','Temp','Gas','clean_points_flag','Hour'])


df = df[df['clean_points_flag']==True]
df = df[df['Gas']=='NO2']
mist=[]
df['Temp'] = pd.to_numeric(df['Temp'], errors='coerce')  # Convert to numeric, coerce errors to NaN

df['timestamp'] = pd.to_datetime(df['timestamp'])

# Filter the DataFrame to include only rows within the specified hours (9 AM to 5 PM)
filtered_df = df[(df['timestamp'].dt.hour >= 9) & (df['timestamp'].dt.hour <= 17)]
print(filtered_df)
# Drop rows with NaN values in 'Temp' column
df.dropna(subset=['Temp'], inplace=True)
# Set the view options for the map
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Extract Date from Timestamp
df['Date'] = df['timestamp'].dt.date
daily_avg_temperatures = df.groupby('Date')['Temp'].mean()

#Find the hottest and coldest days
#hottest_days = daily_avg_temperatures.nlargest(3)
#coldest_days = daily_avg_temperatures.nsmallest(2)

#print("Two hottest days:")
#for date, temp in hottest_days.items():
 #   print(f"Date: {date}, Temperature: {temp}")

#print("\nTwo coldest days:")
#for date, temp in coldest_days.items():
   # print(f"Date: {date}, Temperature: {temp}")



print("WE DONE")

grouped_data = set(df['Date'])

# Iterate through each group (day)


for date in grouped_data:
    
    group  = df[df['Date']==date]
    
    group.drop(columns = ['Date'], inplace=True)
    # Set the view options for the map
       
    view_state = pdk.ViewState(
        latitude=group['Latitude'].mean(), #it was df before group
        longitude=group['Longitude'].mean(), #it was df before group
        zoom=11.5
    )

    # Define the layer
    layer = pdk.Layer(
     'ScatterplotLayer',
     data=group,
     get_position=['Longitude', 'Latitude'],
     get_color=[0, 0, 0],
     
     get_radius=10,  # Adjust radius size to your preference
 )
# HIGHER ZOOM NUMBER EQUALS MORE ZOOM IN

    #group_dict = group.to_dict(orient='records') #added this
    
   # layer = pdk.Layer(
       # "HeatmapLayer",
       # data=group, 
       # get_position=['Longitude', 'Latitude'],
        #aggregation='MEAN',
        #get_weight="Temp",  # Use the temperature column as the weight for the heatmap
       # radius_pixels=60,  # Adjust the radius to control the area covered by each point
       # intensity=1,  # Adjust intensity for visual impact
       # threshold=0.05,  # Minimum threshold for rendering; lower values give a broader heat effect
       # color_range=[
       # [0, 128, 0],  # Blue, cooler
       # [50, 205, 50],  # Light blue
       # [255, 255, 0],  # Very light blue
       # [255, 165, 0],  # Light red
       # [255, 0, 0],   # Red, hotter
         #this last one was commented out by rama it dos add more color not previosly shown in the other photos
       # ],
       # opacity=0.6  # Adjust opacity for better visualization
    #)

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

    output_file = f'tallinn_adam_{date}.html'
    

    
    
    r.to_html(output_file)
