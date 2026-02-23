import argparse

import requests

from utils import load_env


def create_context_layer(
        domain: str, api_key: str, email: str, name: str, category: str
):
    """Create a new context layer via POST."""
    url = f"{domain}/api/v1/context-layers/"
    headers = {
        "Authorization": f"Token {api_key}",
        "GeoSight-User-Key": email
    }
    payload = {
        "name": name,
        "layer_type": "Cloud Native GIS Layer",
        "category": category
    }
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()


def main(name: str, category: str):
    """Main function to run API flow scripts against a given domain."""
    env = load_env()
    domain = env['DOMAIN']
    api_key = env['API_KEY']
    email = env['EMAIL']
    created = create_context_layer(domain, api_key, email, name, category)
    print(
        f"Created with id {created['id']}. "
        f"Please save this so you can use it in the next steps."
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create a Cloud Native GIS context layer."
    )
    parser.add_argument(
        "--name", required=True, help="Name of the context layer."
    )
    parser.add_argument(
        "--category", required=True, help="Category of the context layer."
    )
    args = parser.parse_args()

    main(name=args.name, category=args.category)
