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

import typing

import numpy as np
import rasterio
import shapely
from pyproj import Transformer
from rasterio.mask import mask
from shapely.ops import transform
import jenkspy


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


class ClassifyRasterData:
    """Classify raster data."""

    def __init__(
            self,
            raster_path: str,
            class_type: str,
            class_num: str,
            colors: list = None,
            classify_colors: bool = False,
            minimum: float = None,
            maximum: float = None
    ):
        """Init classify raster data."""
        self.raster_path = raster_path
        self.class_type = class_type
        self.class_num = class_num
        self.colors = colors
        self.classify_colors = classify_colors
        self.minimum = minimum
        self.maximum = maximum

    def classify_natural_breaks(self, data):
        """
        Classify a NumPy array into n natural breaks classes.

        Args:
            data (numpy.ndarray): Input array to classify.

        Returns:
            numpy.ndarray: Array of class labels (1 to self.class_num).
        """
        # Fix random seed for reproducibility
        np.random.seed(42)

        # Find min and max values
        min_value = self.minimum if self.minimum is not None else np.min(data)
        max_value = self.maximum if self.maximum is not None else np.max(data)

        # Ensure min and max values are excluded in the sampled data
        data_without_min_max = data[(data > min_value) & (data < max_value)]

        # Get probabilities proportional to the original distribution
        unique, counts = np.unique(data_without_min_max, return_counts=True)
        probabilities = counts / counts.sum()

        # Perform stratified sampling (excluding min and max)
        sampled_data = np.random.choice(
            unique,
            size=19998 if len(data_without_min_max) >= 19998 else len(data_without_min_max),
            replace=True,
            p=probabilities
        )

        # Add min and max values back to the sampled data
        final_sample = np.concatenate(([min_value, max_value], sampled_data))
        classification = jenkspy.jenks_breaks(
            final_sample,
            n_classes=self.class_num
        )
        return classification

    def classify_equal_interval(self, data):
        """
        Classify a NumPy array into n equal interval classes.

        Args:
            data (numpy.ndarray): Input array to classify.

        Returns:
            numpy.ndarray: Array of class labels (1 to self.class_num).
        """
        data_min = self.minimum if self.minimum is not None else np.min(data)
        data_max = self.maximum if self.maximum is not None else np.max(data)
        # Create class boundaries
        intervals = np.linspace(data_min, data_max, self.class_num + 1)

        # Classify data into intervals
        class_labels = np.digitize(data, intervals, right=True)
        # Handle edge case for max value
        class_labels[
            class_labels > self.class_num
        ] = self.class_num

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

        # Find min and max values
        min_value = self.minimum if self.minimum else np.min(data)
        max_value = self.maximum if self.maximum else np.max(data)

        # Ensure min and max values are excluded in the sampled data
        data_without_min_max = data[(data > min_value) & (data < max_value)]
        data = np.concatenate(([min_value, max_value], data_without_min_max))
        data = np.sort(data)

        # Define quantile ranges
        quantiles = np.linspace(0, 1, self.class_num + 1)
        # Compute thresholds based on data
        thresholds = np.quantile(data, quantiles)

        # Classify data into quantile classes
        class_labels = np.digitize(data, thresholds, right=True)
        class_labels[
            class_labels > self.class_num
        ] = self.class_num  # Ensure max value is in the last class

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
        breakpoints = [
            data_mean + i * data_std for i in range(
                -self.class_num // 2,
                self.class_num // 2 + 1
            )
        ]

        # Classify data into standard deviation-based classes
        class_labels = np.digitize(data, breakpoints, right=True)

        # Handle edge case for max value (last class)
        class_labels[class_labels > self.class_num] = self.class_num

        return class_labels, data_mean, data_std

    def build_classification(self, classification: list):
        """Build classification and its colors."""
        result = []
        for idx, threshold in enumerate(classification):
            if idx < len(classification) - 1:
                result.append({
                    'bottom': threshold,
                    'top': classification[idx + 1],
                    'color': self.colors[idx]
                })
        return result

    def run(self):
        """Run raster classification."""
        from geosight.data.models.style.base import DynamicClassificationType

        with rasterio.open(self.raster_path) as src:
            data = src.read(1)
            data = np.ma.masked_invalid(data)
            data = np.ma.masked_equal(data, src.nodata).compressed()
            data = np.sort(data)

            classification = []
            if self.class_type == DynamicClassificationType.NATURAL_BREAKS:
                classification = self.classify_natural_breaks(data)
            elif self.class_type == DynamicClassificationType.EQUIDISTANT:
                classification = self.classify_equal_interval(data)
            elif self.class_type == DynamicClassificationType.QUANTILE:
                classification = self.classify_quantile(data)
                classification = list(sorted(set(classification)))
            else:
                classification = []
            # elif self.class_type == STANDARD_DEVIATION:
            #     classification = self.classify_std_deviation(data)

            if self.classify_colors:
                return self.build_classification(classification)
            return classification
