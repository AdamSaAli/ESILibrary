from Data_Retreival import time_conv
from Data_Retreival import convert_dmm_to_decimal
from Data_Retreival import get_data_by_deviceId_between_dates
#from data_retreivalfuncs_thatuse_id_insteadof_recid import get_data_by_deviceId_between_dates
#from Data_Retreival import get_data_by_deviceId_between_dates_by_sensor
import pandas as pd
import numpy as np
import h3
import folium
from scipy import stats
from bson import ObjectId
from shapely.wkt import loads
from shapely.geometry import Point,Polygon

file = 'Tallinn - Tram layer2.csv'

def geofence(df, shape_file_csv):
    data = pd.read_csv(shape_file_csv)
 
    # Extract the WKT string from the DataFrame
    wkt_string = data.iloc[0, 0]
 
    # Convert the WKT LINESTRING to a Shapely LineString object
    line = loads(wkt_string)
 
    # Convert LineString to a Polygon by closing the loop
    # Ensure the LINESTRING is closed by repeating the first point at the end if it's not already closed
    if line.coords[0] != line.coords[-1]:
        line = Polygon(line.coords[:] + [line.coords[0]])
    else:
        line = Polygon(line.coords[:])
 
    is_inside = []
    df.reset_index(inplace=True)
    for i in range(len(df)):
        is_inside.append(Point(df['Longitude'][i],df['Latitude'][i]).within(line))
    df['clean_points_flag'] = is_inside
    return df


def is_valid_coord(coord):
    if coord is None:
        return False
    # Return False if either element in the array is null
    return not (coord[0] == 'NULL' or coord[1] == 'NULL')

def load_and_clean_data(df, lat_col, lon_col, value_col, objectid_col, gas_col, gas_type):
    print(f"Total data points before filtering: {len(df)}")
    print(f"Columns in the DataFrame: {df.columns.tolist()}")
    
    # Filter the DataFrame for the specified gas type
    df = df[df[gas_col] == gas_type]
    print(f"Data points after filtering for {gas_type}: {len(df)}")
    
    # Convert columns to numeric, dropping any non-numeric values
    df[lat_col] = pd.to_numeric(df[lat_col], errors='coerce')
    df[lon_col] = pd.to_numeric(df[lon_col], errors='coerce')
    df[value_col] = pd.to_numeric(df[value_col], errors='coerce')
    
    # Drop rows with missing values
    df = df.dropna(subset=[lat_col, lon_col, value_col])
    print(f"Data points after dropping rows with missing values: {len(df)}")
    
    # Extract datetime from objectid
    df['Time'] = df[objectid_col].apply(lambda x: ObjectId(x).generation_time)
    
    return df

def calculate_hotspots(df, lat_col, lon_col, value_col, resolution=11):
    # Convert lat/lon to H3 indices
    df['h3_index'] = df.apply(lambda row: h3.geo_to_h3(row[lat_col], row[lon_col], resolution), axis=1)
    
    # Group by H3 index and calculate mean value
    h3_grouped = df.groupby('h3_index')[value_col].mean().reset_index()
    
    # Calculate z-scores
    h3_grouped['z_score'] = stats.zscore(h3_grouped[value_col])
    
    return h3_grouped

def create_hotspot_map(h3_data, center_lat, center_lon, value_col, title):
    # Create a map centered on the data
    m = folium.Map(location=[center_lat, center_lon], zoom_start=11)
    
    # Define color scale
    def get_color(z_score):
        if z_score < -2:
            return '#0000FF'  # Blue for cold spots
        elif z_score < -1:
            return '#00FFFF'  # Cyan for slightly cold spots
        elif z_score < 1:
            return '#FFFFFF'  # White for neutral
        elif z_score < 2:
            return '#FFFF00'  # Yellow for slightly hot spots
        else:
            return '#FF0000'  # Red for hot spots
    
    # Add hexagons to the map
    for _, row in h3_data.iterrows():
        hex_boundary = h3.h3_to_geo_boundary(row['h3_index'])
        color = get_color(row['z_score'])
        tooltip_text = f"Z-score: {row['z_score']:.2f}, {value_col.capitalize()}: {row[value_col]:.2f}"
        folium.Polygon(
            locations=hex_boundary,
            color=color,
            fill=True,
            fillColor=color,
            fillOpacity=0.7,
            tooltip=tooltip_text
        ).add_to(m)
    
    # Save map
    m.save(f'{title}.html')

# Main execution
if __name__ == "__main__":
    # Retrieve and preprocess data
    df = get_data_by_deviceId_between_dates()
    print("Initial data points:", len(df))

    df = df.dropna(subset=['Gas', 'Temp'])
    print("After dropping NaNs in Gas and Temp:", len(df))

    mask = df['Coord'].apply(is_valid_coord)
    filtered_df = df[mask]
    print("After filtering valid coordinates:", len(filtered_df))

    # Filter for clean points, SPEAKWITH RAMA ABOUT THIS
   # filtered_df = filtered_df[filtered_df['clean_points_flag'] == True]
    print(f"After filtering for clean points: {len(filtered_df)}")

    # Convert Coord column to Latitude and Longitude
    hi = convert_dmm_to_decimal(filtered_df, 'Coord')
    filtered_df['Latitude'] = hi['Latitude']
    filtered_df['Longitude'] = hi['Longitude']
    filtered_df['_recid'] = hi['_recid']  # Ensure _recid is carried over if it gets modified
    print(f"Data points after coordinate conversion: {len(filtered_df)}")

    filtered_df = geofence(filtered_df, file)
    filtered_df = filtered_df[filtered_df['clean_points_flag'] == True]

    # Ensure the required columns are present before calling load_and_clean_data
    if 'Latitude' in filtered_df.columns and 'Longitude' in filtered_df.columns:
        # Use load_and_clean_data function to filter for NO2 and clean the data
        filtered_df = load_and_clean_data(filtered_df, 'Latitude', 'Longitude', 'Temp', '_recid', 'Gas', 'NO2')

        # Apply time conversion
        bye = time_conv(filtered_df, '_recid')
        df = bye  # Use the `bye` DataFrame as the final cleaned DataFrame
        print(f"Data points after all filtration: {len(df)}")
        
        # Define time intervals
        time_intervals = {
            '12am-6am': (pd.Timestamp('00:00:00').time(), pd.Timestamp('06:00:00').time()),
            '6am-12pm': (pd.Timestamp('06:00:00').time(), pd.Timestamp('12:00:00').time()),
            '12pm-6pm': (pd.Timestamp('12:00:00').time(), pd.Timestamp('18:00:00').time()),
            '6pm-12am': (pd.Timestamp('18:00:00').time(), pd.Timestamp('23:59:59').time())
        }
        
        # Generate heatmaps for each time interval
        for interval, (start_time, end_time) in time_intervals.items():
            # Filter data by time interval
            filtered_df = df[(df['Time'].dt.time >= start_time) & (df['Time'].dt.time < end_time)]
            print(f"Data points in interval {interval}: {len(filtered_df)}")
            
            # Calculate hotspots
            if not filtered_df.empty:
                
                hotspots = calculate_hotspots(filtered_df, 'Latitude', 'Longitude', 'Temp')
                filtered_df.to_csv('hi.csv')
                # Create map
                center_lat = filtered_df['Latitude'].mean()
                center_lon = filtered_df['Longitude'].mean()
                create_hotspot_map(hotspots, center_lat, center_lon, 'Temp', interval)
            else:
                print(f"No data available for interval {interval}")
        
        print("Heatmaps have been saved as HTML files.")
    else:
        print("Latitude and/or Longitude columns are missing.")