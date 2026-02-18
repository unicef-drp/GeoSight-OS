# Cloud Native GIS API Flow Scripts

Scripts for testing the Cloud Native GIS context layer API endpoints.

## Setup

1. Copy `.env.example` to `.env` and fill in your values:

```
DOMAIN=http://localhost:2000
API_KEY=your-api-key-here
```

2. Install dependencies:

```bash
pip install requests
```

## Scripts

### 1. Create a context layer

```bash
python context_layer_create.py --name "My Layer" --category "Test"
```

| Argument | Required | Description |
|---|---|---|
| `--name` | Yes | Name of the context layer |
| `--category` | Yes | Category of the context layer |

Returns the created layer's ID. Save this for use in subsequent steps.

### 2. List context layers

```bash
python context_layer_list.py
python context_layer_list.py --page 2
```

| Argument | Required | Description |
|---|---|---|
| `--page` | No | Page number (default: 1) |

### 3. Replace data on a context layer

```bash
python context_layer_replace_data.py --context-layer-id 1 --file test.json
```

| Argument | Required | Description |
|---|---|---|
| `--context-layer-id` | Yes | ID of the context layer |
| `--file` | Yes | Path to a GeoJSON file to upload |

Replaces all data on the layer with the contents of the GeoJSON file, then prints the updated attributes.

### 4. Download data from a context layer

```bash
python context_layer_download_data.py --context-layer-id 1 --file-format geojson
python context_layer_download_data.py --context-layer-id 1 --file-format shapefile --output-dir ./downloads
```

| Argument | Required | Description |
|---|---|---|
| `--context-layer-id` | Yes | ID of the context layer |
| `--file-format` | Yes | One of: `original`, `geojson`, `shapefile`, `geopackage`, `kml` |
| `--output-dir` | No | Directory to save the file (default: current directory) |

This triggers an async download. The script polls the download URL until the file is ready, then saves it locally.

## Typical flow

```bash
# 1. Create a layer
python context_layer_create.py --name "Somalia Health Facilities" --category "Health"
# Note the returned ID, e.g. 42

# 2. Upload data to it
python context_layer_replace_data.py --context-layer-id 42 --file test.json

# 3. Verify it appears in the list
python context_layer_list.py

# 4. Download the data
python context_layer_download_data.py --context-layer-id 42 --file-format geojson
```