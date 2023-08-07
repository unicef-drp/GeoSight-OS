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
from django.http import HttpResponseBadRequest, HttpResponseRedirect
from django.urls import reverse

from core.email import send_email_to_admins_with_html
from core.models.access_request import UserAccessRequest
from core.models.preferences import SitePreferences
from frontend.views.admin._base import AdminBaseView
from geosight.permission.access import RoleContributorRequiredMixin


class AccessRequestListView(RoleContributorRequiredMixin, AdminBaseView):
    """Access Request Detail View."""

    template_name = 'frontend/admin/access_request/list.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Access Request'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        list_url = reverse('admin-access-request-list-view')
        return f'<a href="{list_url}">Request New Users</a> '

    def check_has_pending_request(self):
        """Check pending request."""
        return UserAccessRequest.objects.filter(
            request_by=self.request.user,
            status=UserAccessRequest.RequestStatus.PENDING,
            type=UserAccessRequest.RequestType.NEW_PERMISSIONS
        ).count() > 10

    def notify_admin(self, request_obj: UserAccessRequest):
        """Notify admin."""
        admin_emails = SitePreferences.preferences().default_admin_emails
        if not admin_emails:
            return
        name_of_user = '-'
        if request_obj.requester_first_name:
            name_of_user = request_obj.requester_first_name
            if request_obj.requester_last_name:
                name_of_user = (
                    f'{name_of_user} {request_obj.requester_last_name}'
                )
        request_from = (
            request_obj.requester_email if name_of_user == '-' else
            name_of_user
        )
        url = (
            self.request.build_absolute_uri(
                reverse(
                    'admin-access-request-permission-detail-view',
                    kwargs={"pk": request_obj.pk}
                )
            )
        )
        if not settings.DEBUG:
            # if not dev env, then replace with https
            url = url.replace('http://', 'https://')
        context = {
            'request_name': 'New Access',
            'request_from': request_from,
            'name_of_user': name_of_user,
            'email_of_user': request_obj.requester_email,
            'description': request_obj.description,
            'url': url
        }
        subject = f'New Access Request from {request_from}'
        send_email_to_admins_with_html(
            subject, context, 'emails/notify_new_request.html'
        )

    def post(self, request, *args, **kwargs):
        """Submit new permission access request."""
        if self.check_has_pending_request():
            return HttpResponseBadRequest('You have limited pending request!')
        user = self.request.user
        try:
            # validate user has email
            user_email = request.POST['user_email']
            if not user_email:
                return HttpResponseBadRequest(
                    'Please provide a valid email address!'
                )
            if not user.email and user_email:
                user.email = user_email
                user.save(update_fields=['email'])
            if user.email != user_email:
                return HttpResponseBadRequest(
                    'Your email does not match with verify email.'
                )
            request_obj = UserAccessRequest.objects.create(
                type=UserAccessRequest.RequestType.NEW_PERMISSIONS,
                status=UserAccessRequest.RequestStatus.PENDING,
                submitted_on=datetime.now(),
                requester_first_name=user.first_name,
                requester_last_name=user.last_name,
                requester_email=user.email,
                description=request.POST['description'],
                request_by=user
            )
            self.notify_admin(request_obj)
            return HttpResponseRedirect(
                reverse(
                    'admin-access-request-list-view'
                ) + '#Permission Requests'
            )
        except KeyError as e:
            return HttpResponseBadRequest(f'{e}')
