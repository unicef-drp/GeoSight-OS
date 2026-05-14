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
__date__ = '01/05/2026'
__copyright__ = ('Copyright 2026, Unicef')

import csv
import io
import json
import os

from django.http import JsonResponse, HttpResponse, Http404
from django.views import View

SDMX_DIR = os.path.dirname(os.path.abspath(__file__))

RESPONSE_DIR = os.path.join(SDMX_DIR, 'response')


class SDMXAgenciesView(View):
    def get(self, request, *args, **kwargs):
        json_path = os.path.join(RESPONSE_DIR, 'agencies.json')
        try:
            with open(json_path) as f:
                data = json.load(f)
        except FileNotFoundError:
            raise Http404
        return JsonResponse(data)


class SDMXDataflowView(View):
    def get(self, request, *args, **kwargs):
        xml_path = os.path.join(RESPONSE_DIR, 'dataflow.xml')
        try:
            with open(xml_path) as f:
                content = f.read()
        except FileNotFoundError:
            raise Http404
        return HttpResponse(content, content_type='application/xml')


class SDMXDataflowVersionView(View):
    def get(self, request, agency_id, dataflow_id, *args, **kwargs):
        xml_path = os.path.join(
            RESPONSE_DIR, agency_id, dataflow_id, 'dataflow_version.xml'
        )
        try:
            with open(xml_path) as f:
                content = f.read()
        except FileNotFoundError:
            raise Http404
        return HttpResponse(content, content_type='application/xml')


class SDMXDataStructureView(View):
    def get(self, request, agency_id, dsd_id, version, *args, **kwargs):
        xml_path = os.path.join(
            RESPONSE_DIR, agency_id, dsd_id, version, 'data_structure.xml'
        )
        try:
            with open(xml_path) as f:
                content = f.read()
        except FileNotFoundError:
            raise Http404
        return HttpResponse(content, content_type='application/xml')


class SDMXDataView(View):
    def _parse_filters(self, key, base_path):
        """Parse dimension key string into a filter map using dimension order from data_structure.json."""
        if not key:
            return {}
        try:
            with open(os.path.join(base_path, 'data_structure.json')) as f:
                structure = json.load(f)
            dimensions = sorted(
                structure['structure']['dimensions']['observation'],
                key=lambda d: d['keyPosition']
            )
            dimension_ids = [
                d['id'] for d in dimensions if d['id'] != 'TIME_PERIOD'
            ]
        except (FileNotFoundError, KeyError):
            return {}

        filters = {}
        for i, part in enumerate(key.split('.')):
            if i < len(dimension_ids) and part:
                filters[dimension_ids[i]] = set(part.split('+'))
        return filters

    def get(self, request, agency_id, dataflow_id, version, key='', *args,
            **kwargs):
        fmt = request.GET.get('format')
        base_path = os.path.join(RESPONSE_DIR, agency_id, dataflow_id, version)

        if fmt == 'fusion-json':
            json_path = os.path.join(base_path, 'data_structure.json')
            try:
                with open(json_path) as f:
                    data = json.load(f)
            except FileNotFoundError:
                raise Http404
            return JsonResponse(data)

        elif fmt == 'csv':
            data_path = os.path.join(base_path, 'data.json')
            try:
                with open(data_path) as f:
                    rows = json.load(f)
            except FileNotFoundError:
                raise Http404

            filters = self._parse_filters(key, base_path)
            if filters:
                rows = [
                    row for row in rows
                    if all(
                        str(row.get(dim)) in [str(v) for v in vals]
                        for dim, vals in filters.items()
                        if dim in row
                    )
                ]

            output = io.StringIO()
            writer = csv.DictWriter(
                output, fieldnames=[
                    'REF_AREA', 'REF_NAME', 'INDICATOR',
                    'TIME_PERIOD', 'OBS_VALUE', 'REF_LEVEL'
                ]
            )
            writer.writeheader()
            writer.writerows(rows)
            return HttpResponse(output.getvalue(), content_type='text/csv')

        else:
            raise Http404
