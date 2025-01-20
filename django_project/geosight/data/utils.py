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
from datetime import datetime, date

import pytz
import shapely
import rasterio
import numpy as np
from rasterio.mask import mask
from shapely.ops import transform
from pyproj import Transformer

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
        class_type: typing.List[shapely.Geometry],
        class_num: str
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

NATURAL_BREAKS = 'natural_breaks'
EQUAL_INTERVAL = 'equal_interval'
QUANTILE = 'quantile'
STANDARD_DEVIATION = 'standard_deviation'

import jenkspy
from django.utils import timezone
import xarray as xr

class ClassifyRasterData():
    """Classify raster data."""

    def __init__(self, raster_path: str, class_type: str, class_num: str):
        self.raster_path = raster_path
        self.class_type = class_type
        self.class_num = class_num

    def classify_equal_interval(self, data):
        """
        Classify a NumPy array into n equal interval classes.

        Args:
            data (numpy.ndarray): Input array to classify.

        Returns:
            numpy.ndarray: Array of class labels (1 to self.class_num).
        """
        data_min = np.min(data)
        data_max = np.max(data)
        intervals = np.linspace(data_min, data_max, self.class_num + 1)  # Create class boundaries

        # Classify data into intervals
        class_labels = np.digitize(data, intervals, right=True)
        class_labels[class_labels > self.class_num] = self.class_num  # Handle edge case for max value

        return intervals

    def classify_quantile(self, data):
        """
        Classify a NumPy array into n quantile-based classes.

        Args:
            data (numpy.ndarray): Input array to classify.

        Returns:
            numpy.ndarray: Array of class labels (1 to self.class_num).
            numpy.ndarray: Quantile thresholds.
        """
        # Calculate quantile thresholds
        quantiles = np.linspace(0, 1, self.class_num + 1)  # Define quantile ranges
        thresholds = np.quantile(data, quantiles)  # Compute thresholds based on data

        # Classify data into quantile classes
        class_labels = np.digitize(data, thresholds, right=True)
        class_labels[class_labels > self.class_num] = self.class_num  # Ensure max value is in the last class

        return thresholds

    def classify_std_deviation(self, data):
        """
        Classify a NumPy array into n classes based on standard deviation.

        Args:
            data (numpy.ndarray): Input array to classify.

        Returns:
            numpy.ndarray: Array of class labels (1 to self.class_num).
            float: Mean of the data.
            float: Standard deviation of the data.
        """
        data_mean = np.mean(data)
        data_std = np.std(data)

        # Define the breakpoints based on the mean and standard deviation
        breakpoints = [data_mean + i * data_std for i in range(-self.class_num // 2, self.class_num // 2 + 1)]

        # Classify data into standard deviation-based classes
        class_labels = np.digitize(data, breakpoints, right=True)

        # Handle edge case for max value (last class)
        class_labels[class_labels > self.class_num] = self.class_num

        return class_labels, data_mean, data_std

    def build_classification(self, classification: list):
        pass

    def run(self):
        with rasterio.open(self.raster_path) as src:
            data = src.read(1)
            data = np.ma.masked_invalid(data)
            data = np.ma.masked_equal(data, src.nodata).compressed()
            # data = np.ma.masked_equal(data, src.nodata)
            # data = np.unique(data)
            data = np.sort(data)

            print(self.class_type, self.class_num)

            start = timezone.now()

            classification = []
            if self.class_type == NATURAL_BREAKS:
                # Fix random seed for reproducibility
                np.random.seed(42)

                # Find min and max values
                min_value = np.min(data)
                max_value = np.max(data)

                # Ensure min and max values are included in the sampled data
                data_without_min_max = data[(data != min_value) & (data != max_value)]

                # Get probabilities proportional to the original distribution
                unique, counts = np.unique(data_without_min_max, return_counts=True)
                probabilities = counts / counts.sum()

                # Perform stratified sampling (excluding min and max)
                sampled_data = np.random.choice(unique, size=19998, replace=True, p=probabilities)

                # Add min and max values back to the sampled data
                final_sample = np.concatenate(([min_value, max_value], sampled_data))
                classification = jenkspy.jenks_breaks(final_sample, n_classes=self.class_num)

                # raster = xr.DataArray(data, attrs={'res': (10.0, 10.0)})
                # from xrspatial.classify import natural_breaks
                #
                # # Set the number of classes
                # num_classes = 5
                #
                # # Apply natural breaks classification
                # classified_raster = natural_breaks(raster, k=num_classes)
            elif self.class_type == EQUAL_INTERVAL:
                classification = self.classify_equal_interval(data)
            elif self.class_type == QUANTILE:
                classification = self.classify_quantile(data)
            elif self.class_type == STANDARD_DEVIATION:
                classification = self.classify_std_deviation(data)

            return classification
