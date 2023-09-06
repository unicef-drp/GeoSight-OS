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
__date__ = '25/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

from datetime import datetime

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.urls import reverse
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from core.email import send_email_with_html
from core.models.access_request import UserAccessRequest
from core.permissions import RoleContributorAuthenticationPermission
from core.serializer.access_request import (
    AccessRequestSerializer,
    AccessRequestDetailSerializer
)

ACCESS_REQUEST_TYPE_LIST = {
    'user': UserAccessRequest.RequestType.NEW_USER,
    'permission': UserAccessRequest.RequestType.NEW_PERMISSIONS
}
User = get_user_model()


class AccessRequestList(APIView):
    """List access request."""

    permission_classes = (RoleContributorAuthenticationPermission,)

    def query(self, request):
        """Return the query."""
        query = UserAccessRequest.objects.all()
        if not request.user.profile.is_admin:
            query = query.filter(request_by=request.user)
        return query

    def get(self, request, request_type, *args, **kwargs):
        """Get access request list."""
        if request_type not in ACCESS_REQUEST_TYPE_LIST:
            raise ValidationError(f'Invalid request type: {request_type}')
        results = self.query(request)
        results = results.filter(
            type=ACCESS_REQUEST_TYPE_LIST[request_type]
        )
        results = results.order_by('-submitted_on')
        status = request.GET.get('status', None)
        if status:
            results = results.filter(status=status)
        return Response(status=200, data=AccessRequestSerializer(
            results, many=True
        ).data)


class AccessRequestCount(AccessRequestList):
    """Access request count."""

    def get(self, request, *args, **kwargs):
        """Get access request list."""
        results = self.query(request).filter(
            status=UserAccessRequest.RequestStatus.PENDING
        ).values('type').annotate(count=Count('type')).order_by('count')
        return Response(status=200, data=results)


class AccessRequestDetail(APIView):
    """Approve/Reject access request."""

    permission_classes = (RoleContributorAuthenticationPermission,)

    def approval_request(
            self, obj: UserAccessRequest, is_approve: bool, remarks: str
    ):
        """Approval request."""
        obj.approved_date = datetime.now()
        obj.approved_by = self.request.user
        obj.approver_notes = remarks
        obj.status = (
            UserAccessRequest.RequestStatus.APPROVED if is_approve else
            UserAccessRequest.RequestStatus.REJECTED
        )
        obj.save()

    def notify_requester_new_user(self, obj: UserAccessRequest):
        """Notify new user."""
        request_from = '-'
        if obj.requester_first_name:
            request_from = obj.requester_first_name
            if obj.requester_last_name:
                request_from = (
                    f'{request_from} {obj.requester_last_name}'
                )
        request_from = (
            obj.requester_email if request_from == '-' else
            request_from
        )
        url = self.request.build_absolute_uri(reverse('home-view'))
        if not settings.DEBUG:
            # if not dev env, then replace with https
            url = url.replace('http://', 'https://')
        context = {
            'is_approved': (
                    obj.status == UserAccessRequest.RequestStatus.APPROVED
            ),
            'request_from': request_from,
            'has_admin_remarks': (
                    obj.approver_notes and len(obj.approver_notes) > 0
            ),
            'admin_remarks': obj.approver_notes,
            'url': url
        }

        if obj.status == UserAccessRequest.RequestStatus.APPROVED:
            subject = 'Success! Your GeoSight account has been created'
        else:
            subject = 'Your GeoSight account request has been rejected'
        send_email_with_html(
            subject, [obj.requester_email], context,
            'emails/notify_signup_request.html'
        )

    def notify_requester_access_request(self, obj: UserAccessRequest):
        """Approval requester for access request."""
        request_from = '-'
        if obj.requester_first_name:
            request_from = obj.requester_first_name
            if obj.requester_last_name:
                request_from = (
                    f'{request_from} {obj.requester_last_name}'
                )
        request_from = (
            obj.requester_email if request_from == '-' else
            request_from
        )
        url = self.request.build_absolute_uri(reverse('home-view'))
        if not settings.DEBUG:
            # if not dev env, then replace with https
            url = url.replace('http://', 'https://')
        context = {
            'is_approved': (
                    obj.status == UserAccessRequest.RequestStatus.APPROVED
            ),
            'request_from': request_from,
            'has_admin_remarks': (
                    obj.approver_notes and
                    len(obj.approver_notes) > 0
            ),
            'admin_remarks': obj.approver_notes,
            'url': url
        }

        if obj.status == UserAccessRequest.RequestStatus.APPROVED:
            subject = 'Success! Your access request has been approved'
        else:
            subject = 'Your access request has been rejected'
        send_email_with_html(
            subject, [obj.requester_email], context,
            'emails/notify_access_request.html',
        )

    def approve_new_user_access(self, obj: UserAccessRequest):
        """Approve new user."""
        # create new user + set as viewer
        user, created = User.objects.get_or_create(
            username=obj.requester_email,
        )
        if created:
            user.first_name = obj.requester_first_name
            user.last_name = (
                obj.requester_last_name if
                obj.requester_last_name else ''
            )
            user.email = obj.requester_email
            user.is_active = True
            user.save()

        obj.request_by = user
        obj.save()
        return user

    def post(self, request, pk, *args, **kwargs):
        """Post data."""
        if not request.user.is_staff:
            return HttpResponseForbidden()

        obj = get_object_or_404(UserAccessRequest, pk=pk)
        is_approve = request.POST.get('is_approve', False)
        remarks = request.POST.get('remarks', None)

        # validate if status is Pending
        if obj.status != UserAccessRequest.RequestStatus.PENDING:
            return HttpResponseBadRequest(
                'The request has been processed!'
            )

        # store approval
        self.approval_request(obj, is_approve, remarks)
        if obj.type == UserAccessRequest.RequestType.NEW_USER:
            if is_approve:
                self.approve_new_user_access(obj)

        # notify requester
        if obj.type == UserAccessRequest.RequestType.NEW_USER:
            self.notify_requester_new_user(obj)
        else:
            self.notify_requester_access_request(obj)
        return Response(
            status=201
        )

    def get(self, request, pk, *args, **kwargs):
        """Get access request detail."""
        if request.user.profile.is_admin:
            request_obj = get_object_or_404(UserAccessRequest, pk=pk)
        else:
            request_obj = get_object_or_404(
                UserAccessRequest.objects.filter(request_by=request.user),
                pk=pk
            )
        return Response(
            status=200,
            data=AccessRequestDetailSerializer(request_obj).data
        )
