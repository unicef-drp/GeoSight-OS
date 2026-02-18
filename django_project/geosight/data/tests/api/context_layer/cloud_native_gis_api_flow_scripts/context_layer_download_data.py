import argparse
import os
import time

import requests

from utils import load_env


def download_data(
        domain: str, api_key: str, layer_id: int, file_format: str
):
    """Download data for a context layer."""
    url = (
        f"{domain}/api/v1/context-layers/{layer_id}"
        f"/data/download/?file_format={file_format}"
    )
    headers = {"Authorization": f"Token {api_key}"}
    response = requests.post(url, headers=headers)
    response.raise_for_status()
    return response.json()


def main(context_layer_id: int, file_format: str, output_dir: str = '.'):
    """Main function to download context layer data."""
    env = load_env()
    domain = env['DOMAIN']
    api_key = env['API_KEY']
    response = download_data(domain, api_key, context_layer_id, file_format)
    print(
        f"Downloading data for layer {context_layer_id} "
        f"in {file_format} format."
    )

    download_path = response['path']
    print(f"Using path {download_path}")

    headers = {"Authorization": f"Token {api_key}"}
    while True:
        r = requests.get(download_path, headers=headers, stream=True)
        if r.status_code == 200:
            content_disposition = r.headers.get('Content-Disposition', '')
            if 'filename=' in content_disposition:
                filename = content_disposition.split('filename=')[-1].strip('"')
            else:
                filename = f"layer_{context_layer_id}.{file_format}"

            filepath = os.path.join(output_dir, filename)
            with open(filepath, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Downloaded to {filepath}")
            break
        print(f"Not ready yet (status {r.status_code}), retrying in 2s...")
        time.sleep(2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Download data for a Cloud Native GIS context layer."
    )
    parser.add_argument(
        "--context-layer-id", required=True, type=int,
        help="Context layer id to download data for."
    )
    parser.add_argument(
        "--file-format", required=True,
        choices=['original', 'geojson', 'shapefile', 'geopackage', 'kml'],
        help="File format for the download."
    )
    parser.add_argument(
        "--output-dir", default=".",
        help="Directory to save the downloaded file (default: current dir)."
    )
    args = parser.parse_args()

    main(
        context_layer_id=args.context_layer_id,
        file_format=args.file_format,
        output_dir=args.output_dir
    )
