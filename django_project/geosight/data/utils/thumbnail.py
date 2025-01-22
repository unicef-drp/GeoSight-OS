# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '22/01/2023'
__copyright__ = ('Copyright 2025, Unicef')

import os
import shutil
import tempfile
import typing

from PIL import Image


def create_thumbnail(
        input_path: typing.Union[str, os.PathLike],
        output_path: typing.Union[str, os.PathLike],
        thumbnail_size = (600, 380), quality: int = 85
):
    """
    Resize a large image to a thumbnail size with high quality, preserving aspect ratio.  # noqa

    Args:
        input_path (str): Path to the input image file (JPG or PNG).
        output_path (str): Path to save the thumbnail image.
        thumbnail_size (tuple): Desired size of the thumbnail (width, height).
        quality (int): Quality for the output JPEG (1-100).
    """
    try:
        # Open the image
        img = Image.open(input_path)

        # Ensure the image is in RGB mode for JPEG compatibility
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")

        output_format = "JPEG"
        if input_path.endswith(".png"):
            output_format = "PNG"

        # Preserve aspect ratio and create thumbnail
        img.thumbnail(thumbnail_size, Image.Resampling.LANCZOS)

        if input_path == output_path:
            temp_file = tempfile.NamedTemporaryFile(delete=False)
            img.save(temp_file.name, format=output_format, quality=quality)

            # Replace the original file
            shutil.move(temp_file.name, output_path)
        else:
            # Save the thumbnail (always as JPEG for web-friendly format)
            img.save(output_path, format=output_format, quality=quality)
    except Exception as e:
        print(f"Error creating thumbnail: {e}")