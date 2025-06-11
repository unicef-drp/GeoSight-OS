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

from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.api.base import FilteredAPI
from core.pagination import Pagination
from geosight.importer.models.log import (
    ImporterLog
)
from geosight.importer.serializer.log import (
    ImporterLogSerializer
)


class ImporterLogListAPI(ListAPIView, FilteredAPI):
    """Return Data List API List."""

    pagination_class = Pagination
    serializer_class = ImporterLogSerializer

    def get_serializer_context(self):
        """
        Extend the default serializer context with the requesting user.

        :return: Context dictionary including the request user.
        :rtype: dict
        """
        context = super().get_serializer_context()
        context.update({"user": self.request.user})
        return context

    def get_queryset(self):
        """
        Return a filtered queryset of ImporterLog entries.

        If the requesting user is not an admin, only logs created by that user
        are returned,.

        :return: A filtered and ordered queryset of `ImporterLog` objects.
        :rtype: QuerySet
        """
        query = ImporterLog.objects.all().order_by('-start_time')
        if not self.request.user.profile.is_admin:
            query = ImporterLog.objects.filter(
                importer__creator=self.request.user
            ).prefetch_related(
                'importerlogdata_set'
            ).order_by('importer', '-end_time')

        # Filter by parameters
        query = self.filter_query(self.request, query, ['page', 'page_size'])
        return query

    def delete(self, request):
        """
        Delete ImporterLog objects if the user has permission.

        Parses a list of IDs from the request data.
        For each `ImporterLog` object found, it checks whether the associated
        importer is editable by the requesting user.
        If so, all related `ImporterLog` entries for that importer are deleted.

        :param request:
            The HTTP request containing a list of ImporterLog IDs to delete.
        :type request: Request
        :return: A response indicating deletion success.
        :rtype: Response
        """
        try:
            ids = json.loads(request.data['ids'])
        except TypeError:
            ids = request.data['ids']
        for obj in ImporterLog.objects.filter(id__in=ids):
            if obj.importer.able_to_edit(self.request.user):
                obj.importer.importerlog_set.all().delete()
        return Response('Deleted')


class ImporterLogDetailAPI(APIView):
    """API for detail of Importer Log."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        """
        Retrieve a specific ImporterLog by primary key.

        :param request: The HTTP request.
        :type request: Request
        :param pk: The primary key of the ImporterLog to retrieve.
        :type pk: int or str
        :return: Serialized ImporterLog data.
        :rtype: Response
        """
        obj = get_object_or_404(ImporterLog, pk=pk)
        return Response(
            ImporterLogSerializer(obj, context={'user': request.user}).data
        )

    def delete(self, request, pk):
        """
        Delete a specific ImporterLog by primary key if user has permission.

        If the user is not allowed to edit the associated importer,
        returns a 403 Forbidden.

        :param request: The HTTP request.
        :type request: Request
        :param pk: The primary key of the ImporterLog to delete.
        :type pk: int or str
        :return: A response indicating success or failure.
        :rtype: Response or HttpResponseForbidden
        """
        obj = get_object_or_404(ImporterLog, pk=pk)
        if not obj.importer.able_to_edit(self.request.user):
            return HttpResponseForbidden()
        obj.delete()
        return Response('Deleted')
