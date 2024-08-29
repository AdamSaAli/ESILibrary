import sys
import pandas as pd
import folium
import h3
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

def process_selected_hours(df, lat_col, lon_col, value_col, datetime_col, resolution, percentile, start_date, end_date, selected_hours):
    # Convert start_date and end_date to timezone-aware datetime objects
    start_date = pd.to_datetime(start_date).tz_localize('UTC')
    end_date = pd.to_datetime(end_date).tz_localize('UTC')

    # Filter DataFrame based on the provided date range
    mask = (df['Time'] >= start_date) & (df['Time'] <= end_date)
    df = df.loc[mask]

    map_urls = []

    # Combine all selected hours into a single title
    title = f"hour_{'_'.join(map(str, selected_hours))}_percentile"

    for hour in selected_hours:
        # Convert selected hour to a specific time range (e.g., hour 1 = 01:00:00 - 01:59:59)
        start_time = pd.Timestamp(f"{hour:02}:00:00").time()
        end_time = pd.Timestamp(f"{(hour+1) % 24:02}:00:00").time()

        # Filter data by the selected hour
        hour_df = df[(df['Time'].dt.time >= start_time) & (df['Time'].dt.time < end_time)]
        print(f"Data points in hour {hour}: {len(hour_df)}")
        
        if not hour_df.empty:
            # Calculate H3 indices for each data point in the selected hour
            hour_df['h3_index'] = hour_df.apply(lambda row: h3.geo_to_h3(row[lat_col], row[lon_col], resolution), axis=1)
            
            # Group data by H3 index and calculate the mean value for the selected hour
            h3_grouped = hour_df.groupby('h3_index')[value_col].mean().reset_index()

            # Calculate the percentile threshold value for the selected hour
            threshold_value = h3_grouped[value_col].quantile(percentile / 100)

            # Assign colors to all data points based on the threshold
            h3_grouped['color'] = h3_grouped[value_col].apply(lambda x: '#FF0000' if x >= threshold_value else '#0000FF')

            # Create the map for the selected hours
            center_lat = hour_df[lat_col].mean()
            center_lon = hour_df[lon_col].mean()
            map_url = create_hotspot_map(h3_grouped, center_lat, center_lon, value_col, title)
            map_urls.append(map_url)

    return map_urls

def create_hotspot_map(h3_data, center_lat, center_lon, value_col, title):
    m = folium.Map(location=[center_lat, center_lon], zoom_start=11)

    for _, row in h3_data.iterrows():
        hex_boundary = h3.h3_to_geo_boundary(row['h3_index'])
        color = row['color']
        tooltip_text = f"{value_col.capitalize()}: {row[value_col]:.2f}"
        folium.Polygon(
            locations=hex_boundary,
            color=color,
            fill=True,
            fillColor=color,
            fillOpacity=0.7,
            tooltip=tooltip_text
        ).add_to(m)
    
    # Save the map with a title based on the selected hours in the public directory
    map_file = os.path.join('public', f'{title}_hotspot_map.html')
    m.save(map_file)
    print(f"Map for {title} saved as {map_file}")
    
    return map_file

def main(file_path, percentile, start_date, end_date, selected_hours):
    lat_col = 'Latitude'
    lon_col = 'Longitude'
    value_col = 'Temp'
    datetime_col = 'timestamp'  # Replace with the actual column name for datetime

    df = load_and_clean_data(file_path, lat_col, lon_col, value_col, datetime_col)
    df = df[df['clean_points_flag'] == True]  # Assuming you have a 'clean_points_flag' column to filter valid data

    resolution = 11  # H3 resolution level, adjust as necessary
    map_urls = process_selected_hours(df, lat_col, lon_col, value_col, datetime_col, resolution, percentile, start_date, end_date, selected_hours)

    for url in map_urls:
        print(f"Generated map: {url}")

if __name__ == "__main__":
    # Adjust the file path to be absolute or relative correctly
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, '..', 'public', 'Tallinn40v3.csv')
    
    # Check if the date range, percentile, and selected hours arguments were provided
    if len(sys.argv) > 4:
        percentile = float(sys.argv[1])
        start_date = sys.argv[2]
        end_date = sys.argv[3]
        selected_hours = list(map(int, sys.argv[4:]))  # Convert hour inputs to integers
    else:
        raise ValueError("Please provide percentile, start_date, end_date, and selected hours as arguments.")
    
    main(file_path, percentile, start_date, end_date, selected_hours)