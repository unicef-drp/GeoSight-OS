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

from django.shortcuts import reverse
from rest_framework import serializers

from core.serializer.dynamic_serializer import DynamicModelSerializer
from geosight.data.models.indicator import Indicator
from geosight.data.models.sharepoint import SharepointConfig
from geosight.data.serializer.indicator import IndicatorBasicListSerializer
from geosight.importer.models.importer import Importer


class ImporterSerializer(DynamicModelSerializer):
    """Serializer for Importer."""

    name = serializers.SerializerMethodField()
    reference_layer = serializers.SerializerMethodField()
    reference_layer_name = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    schedule_type = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()
    job_active = serializers.SerializerMethodField()
    attributes = serializers.SerializerMethodField()
    logs = serializers.SerializerMethodField()
    last_run = serializers.SerializerMethodField()
    last_run_result = serializers.SerializerMethodField()
    alerts = serializers.SerializerMethodField()

    urls = serializers.SerializerMethodField()

    def get_name(self, obj: Importer):
        """Return name of importer."""
        if obj.job_name:
            return obj.job_name
        else:
            return None

    def get_reference_layer(self, obj: Importer):
        """Return reference_layer."""
        if obj.reference_layer:
            return obj.reference_layer.identifier
        else:
            return None

    def get_reference_layer_name(self, obj: Importer):
        """Return reference_layer name."""
        if obj.reference_layer:
            return obj.reference_layer.full_name()
        else:
            return None

    def get_created_by(self, obj: Importer):
        """Return creator name."""
        if obj.creator:
            return obj.creator.get_full_name()
        else:
            return None

    def get_schedule_type(self, obj: Importer):
        """Return schedule_type."""
        return obj.schedule_type

    def get_schedule(self, obj: Importer):
        """Return job_active."""
        return obj.schedule

    def get_job_active(self, obj: Importer):
        """Return job_active."""
        return obj.job_active

    def get_attributes(self, obj: Importer):
        """Return importer attributes."""
        attrs = {}
        for attr in obj.importerattribute_set.order_by('name'):
            if not attr.file:
                attrs[attr.name] = attr.value
                if attr.name == 'sharepoint_config_id':
                    try:
                        attrs['sharepoint_config_name'] = \
                            SharepointConfig.objects.get(id=attr.value).name
                    except SharepointConfig.DoesNotExist:
                        attrs['sharepoint_config_name'] = (
                            f'Sharepoint {attr.value} does not exist'
                        )
            else:
                attrs[attr.name] = attr.file.url
            if attr.name == 'selected_indicators':
                attrs[attr.name] = json.loads(attr.value)
                attrs['selected_indicators_data'] = Indicator.objects.filter(
                    id__in=attrs[attr.name]
                ).values_list('shortcode', flat=True)
        try:
            if 'indicator_data_value' in attrs:
                attrs['indicator_data'] = IndicatorBasicListSerializer(
                    Indicator.objects.get(
                        pk=attrs['indicator_data_value']
                    )
                ).data
        except Indicator.DoesNotExist:
            pass
        return attrs

    def get_logs(self, obj: Importer):
        """Return importer attributes."""
        from geosight.importer.serializer.log import ImporterLogSerializer
        return ImporterLogSerializer(
            obj.importerlog_set.all()[:5], many=True,
            fields=['id', 'start_time', 'end_time', 'status'],
            ignore_to_presentation=True
        ).data

    def get_last_run(self, obj: Importer):
        """Return last run."""
        if obj.importerlog_set.first():
            return obj.importerlog_set.first().start_time
        else:
            return '-'

    def get_last_run_result(self, obj: Importer):
        """Return importer attributes."""
        if obj.importerlog_set.first():
            return obj.importerlog_set.first().status
        else:
            return '-'

    def get_urls(self, obj: Importer):
        """Return job detail url."""
        return {
            'run': '' if not obj.job else reverse(
                'importer-run-api', args=[obj.id]
            ),
            'detail': '' if not obj.job else reverse(
                'admin-importer-detail-view', args=[obj.id]
            ),
            'edit': '' if not obj.job else reverse(
                'admin-scheduled-importer-edit-view', args=[obj.id]
            ),
            'resume': '' if not obj.job else reverse(
                'importer-resume-api', args=[obj.id]
            ),
            'pause': '' if not obj.job else reverse(
                'importer-pause-api', args=[obj.id]
            ),
            'delete': '' if not obj.job else reverse(
                'importer-detail-api', args=[obj.id]
            ),
        }

    def get_alerts(self, obj: Importer):
        """Return alerts."""
        return [{
            'email': alert.email,
            'on_start': alert.on_start,
            'on_success': alert.on_success,
            'on_failure': alert.on_failure,
        } for alert in obj.importeralert_set.all()]

    class Meta:  # noqa: D106
        model = Importer
        exclude = ()
