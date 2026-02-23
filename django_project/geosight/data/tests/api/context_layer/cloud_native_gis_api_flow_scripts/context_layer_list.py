import argparse
import json

import requests

from utils import load_env


def get_context_layers(domain: str, api_key: str, email: str, page: int = 1):
    """Fetch context layers from the API."""
    url = f"{domain}/api/v1/context-layers/?page={page}"
    headers = {
        "Authorization": f"Token {api_key}",
        "GeoSight-User-Key": email
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


def main(page: int = 1):
    """Main function to run API flow scripts against a given domain."""
    env = load_env()
    domain = env['DOMAIN']
    api_key = env['API_KEY']
    email = env['EMAIL']
    response = get_context_layers(domain, api_key, email, page)
    print(f"Got {len(response)} context layers.")
    print(f"{json.dumps(response, indent=2)}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Fetch context layers from the API."
    )
    parser.add_argument(
        "--page", type=int, default=1,
        help="Page number (default: 1)."
    )
    args = parser.parse_args()

    main(page=args.page)
