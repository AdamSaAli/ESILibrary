import sys
import pandas as pd
import folium
import h3
from scipy import stats
import os

def load_and_clean_data(file_path, lat_col, lon_col, value_col, datetime_col):
    df = pd.read_csv(file_path, low_memory=False)
    df[lat_col] = pd.to_numeric(df[lat_col], errors='coerce')
    df[lon_col] = pd.to_numeric(df[lon_col], errors='coerce')
    df[value_col] = pd.to_numeric(df[value_col], errors='coerce')
    df = df.dropna(subset=[lat_col, lon_col, value_col])
    
    # Create 'Time' column from a datetime column in your CSV
    if datetime_col in df.columns:
        df['Time'] = pd.to_datetime(df[datetime_col], errors='coerce', utc=True)  # Ensure UTC timezone
    else:
        print(f"Column '{datetime_col}' not found. 'Time' column not created.")
    
    return df

def calculate_hotspots(df, lat_col, lon_col, value_col, resolution=11):
    df['h3_index'] = df.apply(lambda row: h3.geo_to_h3(row[lat_col], row[lon_col], resolution), axis=1)
    h3_grouped = df.groupby('h3_index')[value_col].mean().reset_index()
    h3_grouped['z_score'] = stats.zscore(h3_grouped[value_col])
    return h3_grouped

def create_hotspot_map(h3_data, center_lat, center_lon, value_col, title):
    m = folium.Map(location=[center_lat, center_lon], zoom_start=11,scrollWheelZoom=False)
    
    def get_color(z_score):
        if z_score < -2:
            return '#0000FF'
        elif z_score < -1:
            return '#00FFFF'
        elif z_score < 1:
            return '#FFFFFF'
        elif z_score < 2:
            return '#FFFF00'
        else:
            return '#FF0000'

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
    
    # Save each map with a title based on the interval in the public directory
    map_file = os.path.join('public', f'{title}_hotspot_map.html')
    m.save(map_file)
    print(f"Map for {title} saved as {map_file}")

def main(file_path, start_date, end_date):
    lat_col = 'Latitude'
    lon_col = 'Longitude'
    value_col = 'Temp'
    datetime_col = 'timestamp'  # Replace with the actual column name for datetime

    df = load_and_clean_data(file_path, lat_col, lon_col, value_col, datetime_col)
    df = df[df['clean_points_flag'] == True]

    # Convert start_date and end_date to timezone-aware datetime objects
    start_date = pd.to_datetime(start_date, utc=True)
    end_date = pd.to_datetime(end_date, utc=True)

    # Filter DataFrame based on the provided date range
    df = df[(df['Time'] >= start_date) & (df['Time'] <= end_date)]

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
            hotspots = calculate_hotspots(filtered_df, lat_col, lon_col, value_col)
            
            # Create map
            center_lat = filtered_df[lat_col].mean()
            center_lon = filtered_df[lon_col].mean()
            create_hotspot_map(hotspots, center_lat, center_lon, value_col, interval)
        else:
            print(f"No data available for interval {interval}")

    print("All maps have been saved.")

if __name__ == "__main__":
    print('we here in py file')
    
    if len(sys.argv) >2:
        file_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'Tallinn40v3.csv')
        start_date = sys.argv[1]
        end_date = sys.argv[2]
        main(file_path, start_date, end_date)
    else:
        print("Please provide the start date and end date as arguments.")
        sys.exit(1)
