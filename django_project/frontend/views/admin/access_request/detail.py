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

from abc import ABC
from datetime import datetime

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.http import HttpResponseBadRequest
from django.shortcuts import redirect, get_object_or_404
from django.template.loader import render_to_string
from django.urls import reverse

from core.models.access_request import UserAccessRequest
from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import RoleSuperAdminRequiredMixin

User = get_user_model()


class AccessRequestDetailView(RoleSuperAdminRequiredMixin, AdminBaseView, ABC):
    """Access Request Detail View."""

    TYPE = UserAccessRequest.RequestType.NEW_USER
    LIST_URL = None

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
            subject = 'Success! Your GeoRepo account has been created'
        else:
            subject = 'Your GeoRepo account request has been rejected'
        message = render_to_string(
            'emails/notify_signup_request.html',
            context
        )
        send_mail(
            subject,
            None,
            settings.DEFAULT_FROM_EMAIL,
            [obj.requester_email],
            html_message=message,
            fail_silently=False
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
        message = render_to_string(
            'emails/notify_access_request.html',
            context
        )
        send_mail(
            subject,
            None,
            settings.DEFAULT_FROM_EMAIL,
            [obj.requester_email],
            html_message=message,
            fail_silently=False
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

    def post(self, request, *args, **kwargs):
        """Post data."""
        obj = get_object_or_404(
            UserAccessRequest, id=self.kwargs.get('pk', ''), type=self.TYPE
        )
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
        return redirect(self.LIST_URL)

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        obj = get_object_or_404(
            UserAccessRequest, id=self.kwargs.get('pk', ''), type=self.TYPE
        )
        context['id'] = obj.id
        context['LIST_URL'] = self.LIST_URL
        return context


class AccessRequestUserDetailView(AccessRequestDetailView):
    """Access Request Detail View."""

    TYPE = UserAccessRequest.RequestType.NEW_USER
    template_name = 'frontend/admin/access_request/detail/user.html'

    @property
    def LIST_URL(self):
        """Return list URL."""
        return reverse('admin-access-request-user-list-view')

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Request New User'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return f'<a href="{self.LIST_URL}">Request New User</a> '


class AccessRequestPermissionDetailView(AccessRequestDetailView):
    """Access Request Detail View."""

    TYPE = UserAccessRequest.RequestType.NEW_PERMISSIONS
    template_name = 'frontend/admin/access_request/detail/permission.html'

    @property
    def LIST_URL(self):
        """Return list URL."""
        return reverse('admin-access-request-permission-list-view')

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Request Permission'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return f'<a href="{self.LIST_URL}">Request Permission</a> '
