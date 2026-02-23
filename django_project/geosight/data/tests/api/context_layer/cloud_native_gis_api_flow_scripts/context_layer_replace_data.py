import argparse
import json

import requests

from utils import load_env


def replace_context_layer_data(
        domain: str, api_key: str, email: str, layer_id: int, file_path: str
):
    """Replace data for a context layer via POST."""
    url = f"{domain}/api/v1/context-layers/{layer_id}/data/replace/"
    headers = {
        "Authorization": f"Token {api_key}",
        "GeoSight-User-Key": email
    }
    with open(file_path) as f:
        payload = json.load(f)
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()

    url = f"{domain}/api/v1/context-layers/{layer_id}/attributes/"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def main(context_layer_id: int, file_path: str):
    """Main function to run API flow scripts against a given domain."""
    env = load_env()
    domain = env['DOMAIN']
    api_key = env['API_KEY']
    email = env['EMAIL']

    attributes = replace_context_layer_data(
        domain, api_key, email, context_layer_id, file_path
    )
    print("New data with new attributes inserted successfully.")
    print(f"{attributes}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Run Cloud Native GIS API flow scripts."
    )
    parser.add_argument(
        "--context-layer-id", required=True, type=int,
        help="Context layer id to replace data for."
    )
    parser.add_argument(
        "--file", required=True,
        help="Path to a GeoJSON file to use as payload."
    )
    args = parser.parse_args()

    main(
        context_layer_id=args.context_layer_id, file_path=args.file
    )
