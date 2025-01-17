# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import os
import typing
import tempfile
import shutil
from datetime import datetime, date

import pytz
import shapely
import rasterio
import numpy as np
from rasterio.mask import mask
from shapely.ops import transform
from pyproj import Transformer
from PIL import Image

from django.conf import settings
from django.templatetags.static import static


def sizeof_fmt(num, suffix="B"):
    """Bytes to human readable."""
    for unit in ["", "K", "M", "G", "T", "P", "E", "Z"]:
        if abs(num) < 1024.0:
            return f"{num:3.1f}{unit}{suffix}"
        num /= 1024.0
    return f"{num:.1f}Yi{suffix}"


def path_to_dict(
        path, original_folder=None, ext_filters=None, show_size=False
):
    """Return path as dict with child."""
    filename, ext = os.path.splitext(path)
    if ext_filters and not os.path.isdir(path) and ext not in ext_filters:
        return None
    d = {
        'text': os.path.basename(path),
        'path': path if not original_folder else path.replace(
            original_folder, ''
        ).lstrip('/')
    }
    if os.path.isdir(path):
        d['children'] = []
        for x in os.listdir(path):
            # recursive
            child = path_to_dict(
                os.path.join(path, x), original_folder, ext_filters, show_size
            )
            if child:
                d['children'].append(child)
    else:
        d['type'] = "file"
        d['icon'] = static(f"img/icons/{ext.replace('.', '')}.png")
        if show_size:
            d['text'] += f" ({sizeof_fmt(os.path.getsize(path))})"
    return d


def update_structure(structure: dict, id_mapping: dict):
    """Update structure data with id_mapping."""
    children = []
    try:
        for child in structure['children']:
            if isinstance(child, int):
                try:
                    children.append(id_mapping[child])
                except KeyError:
                    pass
            else:
                children.append(update_structure(child, id_mapping))
    except KeyError:
        pass
    structure['children'] = children
    return structure


def extract_time_string(format_time, value):
    """Return time from string."""
    if value is None:
        return None
    if value.__class__ in [int, float] and len(str(value)) in [10, 13]:
        if len(str(value)) == 13:
            value = value / 1000
        return datetime.fromtimestamp(
            value
        ).replace(tzinfo=pytz.timezone(settings.TIME_ZONE))
    if value.__class__ not in [datetime, date]:
        if not format_time:
            format_time = 'timestamp'
        try:
            if format_time == 'timestamp':
                value = int(float(value))
                value_str = str(value)
                # If len is not 10 or 13
                if len(value_str) not in [10, 13]:
                    raise ValueError()

                # If 13, which is has microseconds
                if len(value_str) == 13:
                    value = value / 1000
                return datetime.fromtimestamp(
                    value
                ).replace(tzinfo=pytz.timezone(settings.TIME_ZONE))
            else:
                return datetime.strptime(
                    str(value).split('.')[0].split('+')[0],
                    format_time
                ).replace(tzinfo=pytz.timezone(settings.TIME_ZONE))
        except ValueError:
            raise ValueError(
                f'Date is not in '
                f'{format_time} format'.replace(
                    '%Y', 'YYYY'
                ).replace('%m', 'MM').replace(
                    '%d', 'DD'
                ).replace('%H', 'HH').replace(
                    '%M', 'MM').replace('%S', 'SS')
            )
    else:
        return value


def run_zonal_analysis(
        raster_path: str,
        geometries: typing.List[shapely.Geometry],
        aggregation: str
):
    """Run zonal analysis on multiple geometries."""
    aggregation = aggregation.lower().strip()
    with rasterio.open(raster_path) as src:
        transformer = Transformer.from_crs(
            "EPSG:4326",
            str(src.crs),
            always_xy=True
        )
        transformed_geoms = [
            transform(
                transformer.transform,
                geometry
            ) for geometry in geometries
        ]
        try:
            out_image, out_transform = mask(src, transformed_geoms, crop=True)
        except ValueError:
            return None
        data = out_image[0]

        # mask invalid data e.g. nan and inf
        data = np.ma.masked_invalid(data)
        # mask nodata
        data = np.ma.masked_equal(data, src.nodata).compressed()
        aggregate = 0
        if aggregation == 'sum':
            aggregate = np.sum(data) if data.size else None
        elif aggregation == 'count':
            aggregate = data.size
        elif aggregation == 'min':
            aggregate = np.min(data) if data.size else None
        elif aggregation == 'max':
            aggregate = np.max(data) if data.size else None
        elif aggregation == 'avg':
            aggregate = np.average(data) if data.size else None
        return aggregate



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
