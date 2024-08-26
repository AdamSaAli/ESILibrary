import os
import pandas as pd
import folium
from scipy import stats
import sys
import h3
def load_and_clean_data(file_path, lat_col, lon_col, value_col, datetime_col):
    df = pd.read_csv(file_path, low_memory=False)
    df[lat_col] = pd.to_numeric(df[lat_col], errors='coerce')
    df[lon_col] = pd.to_numeric(df[lon_col], errors='coerce')
    df[value_col] = pd.to_numeric(df[value_col], errors='coerce')
    df = df.dropna(subset=[lat_col, lon_col, value_col])
    
    # Ensure 'Time' column is created from a datetime column in your CSV
    if datetime_col in df.columns:
        df['Time'] = pd.to_datetime(df[datetime_col])
    else:
        print(f"Column '{datetime_col}' not found. 'Time' column not created.")
        raise KeyError(f"Column '{datetime_col}' not found in the data.")
    
    return df

def calculate_hotspots(df, lat_col, lon_col, value_col, resolution=11):
    df['h3_index'] = df.apply(lambda row: h3.geo_to_h3(row[lat_col], row[lon_col], resolution), axis=1)
    h3_grouped = df.groupby('h3_index')[value_col].mean().reset_index()
    h3_grouped['z_score'] = stats.zscore(h3_grouped[value_col])
    return h3_grouped

def create_hotspot_map(h3_data, center_lat, center_lon, value_col, title):
    m = folium.Map(location=[center_lat, center_lon], zoom_start=11)
    
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
    
    # Save the map with a title based on the interval in the public directory
    map_file = os.path.join('public', f'{title}_hotspot_map.html')
    m.save(map_file)
    print(f"Map for {title} saved as {map_file}")

def main(file_path, selected_hours):
    lat_col = 'Latitude'
    lon_col = 'Longitude'
    value_col = 'Temp'
    datetime_col = 'timestamp'  # Replace with the actual name of your datetime column

    df = load_and_clean_data(file_path, lat_col, lon_col, value_col, datetime_col)
    df = df[df['clean_points_flag'] == True]

    if selected_hours:
        title = f"hour_{'_'.join(map(str, selected_hours))}"
        filtered_df = df[df['Time'].dt.hour.isin(selected_hours)]
        print(f"Data points for hours {selected_hours}: {len(filtered_df)}")
        
        if not filtered_df.empty:
            hotspots = calculate_hotspots(filtered_df, lat_col, lon_col, value_col)
            center_lat = filtered_df[lat_col].mean()
            center_lon = filtered_df[lon_col].mean()
            create_hotspot_map(hotspots, center_lat, center_lon, value_col, title)
        else:
            print(f"No data available for hours {selected_hours}")
    else:
        print("No valid hours provided.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_hours = sys.argv[1].strip()
        if input_hours:
            selected_hours = [int(hour.strip()) for hour in input_hours.split(',') if hour.strip()]
            script_dir = os.path.dirname(__file__)
            file_path = os.path.join(script_dir, '..', 'public', 'Tallinn40v3.csv')
            main(file_path, selected_hours)
        else:
            print("Error: No hours provided.")
            sys.exit(1)
    else:
        print("Error: No hours argument provided.")
        sys.exit(1)