import pandas as pd
import numpy as np
import h3
import folium
from esda.moran import Moran_Local
from libpysal.weights import DistanceBand

def load_and_clean_data(file_path, lat_col, lon_col, value_col):
    df = pd.read_csv(file_path)
    df[lat_col] = pd.to_numeric(df[lat_col], errors='coerce')
    df[lon_col] = pd.to_numeric(df[lon_col], errors='coerce')
    df[value_col] = pd.to_numeric(df[value_col], errors='coerce')
    df = df.dropna(subset=[lat_col, lon_col, value_col])
    return df

def calculate_local_morans_i(df, lat_col, lon_col, value_col, resolution=11):
    df['h3_index'] = df.apply(lambda row: h3.geo_to_h3(row[lat_col], row[lon_col], resolution), axis=1)
    h3_grouped = df.groupby('h3_index')[value_col].mean().reset_index()
    coords = [h3.h3_to_geo(h) for h in h3_grouped['h3_index']]
    coords_array = np.array(coords, dtype=float)
    
    # Create the spatial weights matrix using DistanceBand
    w = DistanceBand(coords_array, threshold=0.001, binary=True, silence_warnings=True)
    
    # Calculate Local Moran's I
    moran_local = Moran_Local(h3_grouped[value_col].values, w)
    
    # Add Moran's I values and p-values to the DataFrame
    h3_grouped['local_moran'] = moran_local.Is
    h3_grouped['p_value'] = moran_local.p_sim
    h3_grouped['mean_value'] = h3_grouped[value_col].mean()
    
    # Add the number of neighbors to each hexagon
    h3_grouped['neighbor_count'] = [len(w.neighbors[i]) for i in range(len(h3_grouped))]
    
    return h3_grouped

def create_hotspot_map(h3_data, center_lat, center_lon, value_col):
    m = folium.Map(location=[center_lat, center_lon], zoom_start=11)

    # Define color coding for Local Moran's I results
    def get_color(row):
        if row['p_value'] <= 0.05:  # Consider only significant results
            if row['local_moran'] > 0:
                if row[value_col] > row['mean_value']:  # High-High (Hotspot)
                    return 'red'
                else:  # Low-Low (Coldspot)
                    return 'blue'
            else:
                if row[value_col] > row['mean_value']:  # High-Low (Spatial Outlier)
                    return 'orange'
                else:  # Low-High (Spatial Outlier)
                    return 'purple'
        else:
            return '#B0B0B0'  # Gray for insignificant

    # Add hexagons to the map
    for _, row in h3_data.iterrows():
        hex_boundary = h3.h3_to_geo_boundary(row['h3_index'])
        color = get_color(row)
        
        # Updated tooltip to include the number of neighbors
        tooltip_text = (
            f"Local Moran's I: {row['local_moran']:.2f}, p-value: {row['p_value']:.4f}, "
            f"{value_col.capitalize()}: {row[value_col]:.2f}, Neighbors: {row['neighbor_count']}"
        )
        
        folium.Polygon(
            locations=hex_boundary,
            color=color,
            fill=True,
            fillColor=color,
            fillOpacity=0.7,
            tooltip=tooltip_text
        ).add_to(m)

    return m

# Main execution
if __name__ == "__main__":
    file_path = 'Tallinn40v3.csv'  # Replace with your CSV file path
    lat_col = 'Latitude'
    lon_col = 'Longitude'
    value_col = 'Temp'
    
    df = load_and_clean_data(file_path, lat_col, lon_col, value_col)
    df = df[df['clean_points_flag'] == True]
    hotspots = calculate_local_morans_i(df, lat_col, lon_col, value_col)
    
    center_lat = df[lat_col].mean()
    center_lon = df[lon_col].mean()
    hotspot_map = create_hotspot_map(hotspots, center_lat, center_lon, value_col)
    
    hotspot_map.save('hotspot_map.html')
    print("Hotspot map has been saved as 'hotspot_map.html'")