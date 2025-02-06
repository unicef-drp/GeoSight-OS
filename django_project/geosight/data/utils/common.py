import uuid
import os
import requests

from django.conf import settings


def download_file_from_url(url: str, dest_path: str = None) -> str:
    """Download a file from a URL to local disk."""
    if not dest_path:
        dest_path = os.path.join(
            settings.MEDIA_TEMP,
            f"{uuid.uuid4().hex}.{url.split('.')[-1]}"
        )

    if not os.path.exists(dest_path):
        response = requests.get(
            url,
            stream=True
        )
        if response.status_code == 200:
            with open(dest_path, "wb") as tmp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    tmp_file.write(chunk)
            return dest_path
        else:
            raise Exception(
                f"Failed to download file: {response.status_code}"
            )
    else:
        return dest_path
