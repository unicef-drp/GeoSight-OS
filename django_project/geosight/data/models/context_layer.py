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
import uuid
from urllib.parse import urlparse, parse_qs
from base64 import b64encode

import requests
from django.conf import settings
from django.contrib.gis.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from core.models import AbstractEditData, AbstractTerm
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

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Override save."""
        super(ContextLayerGroup, self).save(*args, **kwargs)


class ContextLayerRequestError(Exception):
    """Error class for ContextLayer Request."""

    def __init__(self, message):
        """init."""
        self.message = message
        super().__init__(self.message)


class ContextLayer(AbstractEditData, AbstractTerm):
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

    def save_relations(self, data):
        """Save all relationship data."""
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
        except KeyError as e:
            pass

    def _request(self, url, headers=None):
        """Return request of context layer."""
        if not headers:
            headers = {}
        params = {}
        if self.username and self.password:
            basic_auth = b64encode(
                bytes(f"{self.username}:{self.password}", encoding='utf8')  # noqa
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
        """Return arcgis definition."""
        if self.layer_type == LayerType.ARCGIS:
            base_url = self.url.split('?')[0]
            return self._request(url=base_url + '?f=json')
        else:
            return None

    def _arcgis_geojson(self, page: int = 0, bbox=None):
        """Return geojson of context layer if arcgis."""
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
        """Return geojson of context layer."""
        if self.layer_type == LayerType.ARCGIS:
            """This is for ARCGIS layer."""
            return self._arcgis_geojson(bbox=bbox)
        return None

    def update_dashboard_version(self):
        """Update dashboard version."""
        from django.utils import timezone
        from geosight.data.models.dashboard import Dashboard
        Dashboard.objects.filter(
            id__in=self.dashboardcontextlayer_set.values_list(
                'dashboard', flat=True
            )
        ).update(version_data=timezone.now())

    @property
    def token_val(self):
        """Return token."""
        if self.arcgis_config:
            return self.arcgis_config.token_val
        return self.token

    @property
    def cloud_native_gis_layer(self):
        """Return cloud native GIS."""
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
        """Return geojson of context layer."""
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
def increase_version(sender, instance, **kwargs):
    """Increase version of dashboard signal."""
    instance.update_dashboard_version()


class ContextLayerField(FieldLayerAbstract):
    """Field data of context layer."""

    context_layer = models.ForeignKey(
        ContextLayer, on_delete=models.CASCADE
    )

    class Meta:  # noqa: D106
        unique_together = ('context_layer', 'name')

    def __str__(self):
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
        """Mark ZonalAnalysis as failed."""
        self.status = ZonalAnalysis.AnalysisStatus.FAILED
        self.result = message
        self.save()
        return self

    def success(self, result: status):
        """Mark ZonalAnalysis as success."""
        self.status = ZonalAnalysis.AnalysisStatus.SUCCESS
        self.result = result
        self.save()
        return self

    def running(self):
        """Mark ZonalAnalysis as running."""
        self.status = ZonalAnalysis.AnalysisStatus.RUNNING
        self.save()
