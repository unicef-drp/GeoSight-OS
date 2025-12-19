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

import json
import os
import requests
import uuid
from base64 import b64encode
from django.conf import settings
from django.contrib.gis.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _
from urllib.parse import urlparse, parse_qs

from core.models import AbstractEditData, AbstractTerm, AbstractSource
from geosight.data.models.arcgis import ArcgisConfig
from geosight.data.models.field_layer import FieldLayerAbstract
from geosight.data.models.related_table import RelatedTable
from geosight.permission.models.manager import PermissionManager


class LayerType(object):
    """A quick couple of variable and Layer Type string."""

    ARCGIS = 'ARCGIS'
    GEOJSON = 'Geojson'
    RASTER_COG = 'Raster COG'
    RASTER_TILE = 'Raster Tile'
    VECTOR_TILE = 'Vector Tile'
    RELATED_TABLE = 'Related Table'
    CLOUD_NATIVE_GIS_LAYER = 'Cloud Native GIS Layer'


LayerTypeWithOverrideStyle = [
    LayerType.CLOUD_NATIVE_GIS_LAYER, LayerType.RASTER_COG
]


class ContextLayerGroup(AbstractTerm):
    """A model for the group of context layer."""

    pass


class ContextLayerRequestError(Exception):
    """Error class for ContextLayer Request."""

    def __init__(self, message):  # noqa
        """init."""
        self.message = message
        super().__init__(self.message)


class ContextLayer(AbstractEditData, AbstractTerm, AbstractSource):
    """A model for the context layer."""

    group = models.ForeignKey(
        ContextLayerGroup,
        null=True, blank=True,
        on_delete=models.SET_NULL
    )
    url = models.CharField(
        null=True,
        blank=True,
        max_length=10240,
        help_text=(
            'Put full url with parameters that are needed. '
            'Not necesary for Related Table Layer Type.'
        )
    )
    layer_type = models.CharField(
        max_length=256,
        default=LayerType.ARCGIS,
        choices=(
            (LayerType.ARCGIS, LayerType.ARCGIS),
            (LayerType.GEOJSON, LayerType.GEOJSON),
            (LayerType.RASTER_TILE, LayerType.RASTER_TILE),
            (LayerType.RASTER_COG, LayerType.RASTER_COG),
            (LayerType.VECTOR_TILE, LayerType.VECTOR_TILE),
            (LayerType.RELATED_TABLE, LayerType.RELATED_TABLE),
            (
                LayerType.CLOUD_NATIVE_GIS_LAYER,
                LayerType.CLOUD_NATIVE_GIS_LAYER
            ),
        ),
        help_text=_(
            'The type of layer for this context layer.<br>'
            'For <b>ArcGIS</b>, put feature server of REST. e.g : '
            'https://{host}/rest/services/{layer}/FeatureServer/1.<br>'
            'For <b>GeoJson</b>, put url of geojson.<br>'
            'For <b>Raster tile</b>, put XYZ url.<br>'
            'For <b>Raster COG</b>, put url of cog.<br>'
            'For <b>Related table</b>, select existing related table name.<br>'
            'For <b>Vector tile</b>, put XYZ url.<br>'
            'For <b>Cloud native gis layer</b>, '
            'select the layer from cloud native gis.'
        )
    )
    arcgis_config = models.ForeignKey(
        ArcgisConfig,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        help_text=_(
            'ArcGIS configuration that contains username/password '
            'that will be used to autogenerate the token.'
        )
    )
    related_table = models.ForeignKey(
        RelatedTable,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        help_text=_(
            'Related table name.'
        )
    )

    url_legend = models.CharField(
        max_length=256,
        null=True, blank=True,
        help_text=_(
            'This is the url of image that will be rendered as legend. '
            'ArcGIS type can be generated automatically, '
            'but if you fill this url legend, it will be overridden'
        )
    )
    token = models.CharField(
        max_length=512,
        null=True, blank=True,
        help_text=_(
            'Token to access the layer if needed.'
        )
    )
    username = models.CharField(
        max_length=512,
        null=True, blank=True,
        help_text=_(
            'Username to access the layer if needed.'
        )
    )
    password = models.CharField(
        max_length=512,
        null=True, blank=True,
        help_text=_(
            'Password to access the layer if needed.'
        )
    )
    styles = models.TextField(
        null=True, blank=True
    )
    label_styles = models.TextField(
        null=True, blank=True
    )
    configuration = models.JSONField(
        null=True, blank=True
    )
    objects = models.Manager()
    permissions = PermissionManager()

    # Cloud native gis layer
    cloud_native_gis_layer_id = models.IntegerField(
        null=True, blank=True,
        help_text=_(
            'Using layer from cloud native gis.'
        )
    )

    def save(self, *args, **kwargs):
        """Save this context layer instance to the database.

        Performs full validation before saving by calling full_clean().

        :param args: Variable length argument list passed to parent save()
        :type args: list
        :param kwargs: Arbitrary keyword arguments passed to parent save()
        :type kwargs: dict
        :return: None
        """
        self.full_clean()
        super().save(*args, **kwargs)

    def clean(self):
        """Clean and validate the ContextLayer model instance.

        Performs validation checks specific to ContextLayer, in addition to
        parent class validation.

        Checks that the related_table field is populated when layer_type is
        RELATED_TABLE.

        :raises ValidationError: If layer_type is RELATED_TABLE but no related_table
            is specified.

        :return: None
        """
        super().clean()
        if (
                self.layer_type == LayerType.RELATED_TABLE and
                not self.related_table
        ):
            raise ValidationError(
                {
                    'related_table': (
                        'This field is required.'
                    )
                }
            )
        elif (
                self.layer_type == LayerType.CLOUD_NATIVE_GIS_LAYER and
                not self.cloud_native_gis_layer_id
        ):
            raise ValidationError(
                {
                    'cloud_native_gis_layer_id': (
                        'This field is required.'
                    )
                }
            )

    def save_relations(self, data):
        """
        Save field relationships for the context layer.

        This method replaces existing related field records with new ones
        based on ``data_fields`` provided in the submitted form data.

        :param data: Form data containing serialized field definitions.
        :type data: dict
        """
        self.contextlayerfield_set.all().delete()
        try:
            if data['data_fields'] and data['override_field']:
                for idx, field in enumerate(json.loads(data['data_fields'])):
                    ContextLayerField.objects.get_or_create(
                        context_layer=self,
                        name=field['name'],
                        alias=field['alias'],
                        type=field['type'],
                        visible=field.get('visible', True),
                        as_label=field.get('as_label', False),
                        order=idx
                    )
        except KeyError:
            pass

    def _request(self, url, headers=None):
        """
        Perform an authenticated GET request to fetch layer data.

        Automatically adds Basic or Token authentication if configured.

        :param url: The URL to request.
        :type url: str
        :param headers: Optional HTTP headers.
        :type headers: dict or None
        :raises ContextLayerRequestError:
            If the request fails or returns an error response.
        :return: The successful HTTP response.
        :rtype: requests.Response
        """
        if not headers:
            headers = {}
        params = {}
        if self.username and self.password:
            basic_auth = b64encode(
                bytes(f"{self.username}:{self.password}", encoding='utf8')
                # noqa
            ).decode("ascii")
            headers['Authorization'] = f'Basic {basic_auth}'
        if self.token:
            headers['Authorization'] = f'Token {self.token}'
            params['token'] = self.token

        response = requests.get(url=url, params=params, headers=headers)
        if response.status_code != 200:
            raise ContextLayerRequestError(
                f"Error fetching on {url} "
                f"- {response.status_code} - {response.text}"
            )
        _json = response.json()
        if 'error' in _json:
            raise ContextLayerRequestError(
                f"Error fetching on {url} "
                f"- {response.status_code} - {_json['error']['message']}"
            )

        return response

    @property
    def arcgis_definition(self):
        """
        Return ArcGIS layer definition metadata.

        :return:
            ArcGIS REST definition if the layer type is ARCGIS, otherwise None.
        :rtype: requests.Response or None
        """
        if self.layer_type == LayerType.ARCGIS:
            base_url = self.url.split('?')[0]
            return self._request(url=base_url + '?f=json')
        else:
            return None

    def _arcgis_geojson(  # noqa: DOC501, DOC503
            self, page: int = 0, bbox=None
    ):
        """
        Retrieve ArcGIS layer data as GeoJSON.

        Supports pagination for large datasets.

        :param page: The current pagination index.
        :type page: int
        :param bbox: Optional bounding box filter as [xmin, ymin, xmax, ymax].
        :type bbox: list or None
        :return: GeoJSON dictionary of features.
        :rtype: dict or list
        """
        # If page is 0, we need to check if it is paginated
        # If not we will return all data
        limit = 100
        base_url = self.url.split('?')[0]
        parameters = [
            'where=1=1', 'returnGeometry=true', 'outSR=4326', 'outFields=*',
            'inSR=4326', 'geometryType=esriGeometryEnvelope', 'f=geojson'
        ]
        if bbox:
            geom = {
                "xmin": bbox[0], "ymin": bbox[1], "xmax": bbox[2],
                "ymax": bbox[3], "spatialReference": {"wkid": 4326}
            }
            parameters += [f'geometry={json.dumps(geom)}']
        paginated_parameters = parameters + [
            f'resultOffset={page * limit}',
            f'resultRecordCount={limit}'
        ]
        request_url = f'{base_url}/query?'
        if page == 0:
            response = self.arcgis_definition
            output = {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
                "features": []
            }
            try:
                # Check if paginated or not
                paginated = response.json()['advancedQueryCapabilities'][
                    'supportsPaginationOnAggregatedQueries']
                if paginated:
                    # If paginated use the pagination url
                    # Call next page
                    output['features'] += self._request(
                        request_url + '&'.join(paginated_parameters)
                    ).json()['features'] + self._arcgis_geojson(
                        page + 1, bbox=bbox
                    )
                else:
                    raise KeyError
            except KeyError:
                # If not paginated, call whole query
                output['features'] = self._request(
                    request_url + '&'.join(parameters)
                ).json()['features']
            return output
        else:
            # Call next page
            features = self._request(
                request_url + '&'.join(paginated_parameters)
            ).json()['features']
            if features:
                features += self._arcgis_geojson(page + 1, bbox=bbox)
            return features

    def geojson(self, bbox=None):
        """
        Retrieve the layer data as GeoJSON, if supported.

        :param bbox: Optional bounding box to limit the extent.
        :type bbox: list or None
        :return: GeoJSON data or None.
        :rtype: dict or None
        """
        if self.layer_type == LayerType.ARCGIS:
            """This is for ARCGIS layer."""
            return self._arcgis_geojson(bbox=bbox)
        return None

    def update_dashboard_version(self):
        """
        Update version timestamps of dashboards using this layer.

        Called automatically after save to
        invalidate caches and trigger re-sync.
        """
        from django.utils import timezone
        from geosight.data.models.dashboard import Dashboard
        Dashboard.objects.filter(
            id__in=self.dashboardcontextlayer_set.values_list(
                'dashboard', flat=True
            )
        ).update(version_data=timezone.now())

    @property
    def token_val(self):
        """
        Return the effective token for the layer.

        Prefers token from linked ArcGIS configuration if available.

        :return: Token string or None.
        :rtype: str or None
        """
        if self.arcgis_config:
            return self.arcgis_config.token_val
        return self.token

    @property
    def cloud_native_gis_layer(self):
        """
        Retrieve linked Cloud Native GIS layer instance.

        :return: Cloud-native GIS layer model or None.
        :rtype: cloud_native_gis.models.layer.Layer or None
        """
        if settings.CLOUD_NATIVE_GIS_ENABLED:
            from cloud_native_gis.models.layer import Layer
            try:
                return Layer.objects.get(
                    id=self.cloud_native_gis_layer_id
                )
            except Layer.DoesNotExist:
                return None
        return None

    def download_layer(self, original_name=True, bbox=None):
        """
        Download the underlying layer data as a file.

        Supports Raster COG and Raster Tile (WMS) layers.
        Saves downloaded files under ``MEDIA_TEMP``.

        :param original_name: Whether to keep the original filename.
        :type original_name: bool
        :param bbox: Optional bounding box for WMS requests.
        :type bbox: list or None
        :return: Local file path to the downloaded file or None.
        :rtype: str or None
        :raises Exception: If download fails.
        """
        if self.layer_type == LayerType.RASTER_COG:
            # This is for Raster COG layer
            file_name = os.path.basename(self.url)
            # Download the file and save it to
            # a MEDIA file with the same name
            os.makedirs(settings.MEDIA_TEMP, exist_ok=True)
            if original_name:
                tmp_file_path = os.path.join(settings.MEDIA_TEMP, file_name)
            else:
                tmp_file_path = os.path.join(
                    settings.MEDIA_TEMP,
                    uuid.uuid4().hex
                )

            if not os.path.exists(tmp_file_path):
                response = requests.get(self.url, stream=True)
                if response.status_code == 200:
                    with open(tmp_file_path, "wb") as tmp_file:
                        for chunk in response.iter_content(chunk_size=8192):
                            tmp_file.write(chunk)
                    return tmp_file_path
                else:
                    raise Exception(
                        f"Failed to download file: {response.status_code}"
                    )
            else:
                return tmp_file_path
        elif self.layer_type == LayerType.RASTER_TILE:
            # This is for WMS
            parsed_url = urlparse(self.url)
            wms_url = (parsed_url.scheme + "://" +
                       parsed_url.netloc + parsed_url.path)

            # Parse existing query parameters
            query_params = parse_qs(parsed_url.query)
            query_params.update({
                'format': 'image/geotiff',
                'crs': 'EPSG:4326',
                'bbox': ','.join([str(a) for a in bbox]),
                'width': '1024',
                'height': '512'
            })

            # Download the file and save it to
            # a MEDIA file with the same name
            os.makedirs(settings.MEDIA_TEMP, exist_ok=True)
            tmp_file_path = os.path.join(
                settings.MEDIA_TEMP,
                f'{uuid.uuid4().hex}.tif'
            )

            if not os.path.exists(tmp_file_path):
                response = requests.get(
                    wms_url,
                    params=query_params,
                    stream=True
                )
                if response.status_code == 200:
                    with open(tmp_file_path, "wb") as tmp_file:
                        for chunk in response.iter_content(chunk_size=8192):
                            tmp_file.write(chunk)
                    return tmp_file_path
                else:
                    raise Exception(
                        f"Failed to download file: {response.status_code}"
                    )
            else:
                return tmp_file_path
        return None


@receiver(post_save, sender=ContextLayer)
def increase_version(sender, instance, **kwargs):  # noqa :DOC503, DOC103
    """
    Signal handler to update dashboard versions when a ContextLayer is saved.

    :param sender: The model class sending the signal.
    :type sender: type
    :param instance: The saved ContextLayer instance.
    :type instance: ContextLayer
    :param kwargs: Additional keyword arguments.
    :type kwargs: dict
    """
    instance.update_dashboard_version()


class ContextLayerField(FieldLayerAbstract):
    """Field data of context layer."""

    context_layer = models.ForeignKey(
        ContextLayer, on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('context_layer', 'name')

    def __str__(self):
        """Return the display name of the field.

        :return: Display name of the field.
        :rtype: str
        """
        return f'{self.name}'


class ZonalAnalysis(AbstractEditData):
    """Class for Zonal Analysis."""

    class AnalysisStatus(models.TextChoices):
        """Choices of analysis status."""

        PENDING = 'PENDING', _('PENDING')
        RUNNING = 'RUNNING', _('RUNNING')
        SUCCESS = 'SUCCESS', _('SUCCESS')
        FAILED = 'FAILED', _('FAILED')

    uuid = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    context_layer = models.ForeignKey(
        ContextLayer,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    aggregation = models.CharField(
        max_length=10,
        null=True,
        blank=False
    )
    aggregation_field = models.CharField(
        max_length=25,
        null=True,
        blank=False
    )
    geom_compressed = models.TextField()
    status = models.CharField(
        choices=AnalysisStatus.choices,
        default=AnalysisStatus.PENDING,
        max_length=10
    )
    result = models.TextField()

    def failed(self, message: status):
        """
        Mark this analysis as failed.

        :param message: Error message to store as the result.
        :type message: str
        :return: Updated analysis instance.
        :rtype: ZonalAnalysis
        """
        self.status = ZonalAnalysis.AnalysisStatus.FAILED
        self.result = message
        self.save()
        return self

    def success(self, result: status):
        """
        Mark this analysis as successfully completed.

        :param result: Result or output data as text.
        :type result: str
        :return: Updated analysis instance.
        :rtype: ZonalAnalysis
        """
        self.status = ZonalAnalysis.AnalysisStatus.SUCCESS
        self.result = result
        self.save()
        return self

    def running(self):
        """Mark this analysis as currently running."""
        self.status = ZonalAnalysis.AnalysisStatus.RUNNING
        self.save()
