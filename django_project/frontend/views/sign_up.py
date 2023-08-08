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

from datetime import datetime

from captcha.fields import CaptchaField
from django import forms
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views.generic.edit import FormView

from core.email import send_email_to_admins_with_html
from core.models.access_request import UserAccessRequest


class SignUpForm(forms.Form):
    """Sign Up form."""

    required_css_class = 'required'
    first_name = forms.CharField(max_length=150, required=True)
    last_name = forms.CharField(max_length=150, required=False)
    email = forms.EmailField(max_length=255, required=True)
    description = forms.CharField(
        max_length=512, required=True,
        widget=forms.Textarea(attrs={'cols': 30})
    )
    captcha = CaptchaField()

    def send_email(self, obj: UserAccessRequest, request):
        """Send email."""
        name_of_user = '-'
        if obj.requester_first_name:
            name_of_user = obj.requester_first_name
            if obj.requester_last_name:
                name_of_user = (
                    f'{name_of_user} {obj.requester_last_name}'
                )
        request_from = (
            obj.requester_email if name_of_user == '-' else
            name_of_user
        )
        context = {
            'request_name': 'New Sign Up',
            'request_from': request_from,
            'name_of_user': name_of_user,
            'email_of_user': obj.requester_email,
            'description': obj.description,
            'url': request.build_absolute_uri(
                reverse(
                    'admin-access-request-user-detail-view',
                    kwargs={"pk": obj.pk}
                )
            )
        }
        subject = f'New Access Request from {request_from}'
        send_email_to_admins_with_html(
            subject, context, 'emails/notify_new_request.html'
        )

    def save(self, request):
        """Save data."""
        access_request = UserAccessRequest.objects.create(
            type=UserAccessRequest.RequestType.NEW_USER,
            status=UserAccessRequest.RequestStatus.PENDING,
            submitted_on=datetime.now(),
            requester_first_name=self.cleaned_data['first_name'],
            requester_last_name=self.cleaned_data['last_name'],
            requester_email=self.cleaned_data['email'],
            description=self.cleaned_data['description']
        )
        self.send_email(access_request, request)


class SignUpView(FormView):
    """Login Create View."""

    template_name = 'frontend/sign_up.html'
    form_class = SignUpForm
    success_url = "/sign-up/?success=true"

    def form_valid(self, form):
        """Form is valid."""
        if form.is_valid():
            # if user has pending request, then skip save
            check_exist = UserAccessRequest.objects.filter(
                type=UserAccessRequest.RequestType.NEW_USER,
                status=UserAccessRequest.RequestStatus.PENDING,
                requester_email=form.cleaned_data['email']
            ).exists()
            if not check_exist:
                form.save(self.request)
        return super().form_valid(form)

    def get(self, request, *args, **kwargs):
        """GET request."""
        if request.user.is_authenticated:
            return HttpResponseRedirect('/')
        return super(SignUpView, self).get(request, *args, **kwargs)

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'Log In'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return 'Log In'

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = super().get_context_data(**kwargs)
        context.update({
            'content_title': self.content_title,
            'page_title': self.page_title
        })
        context['success'] = self.request.GET.get('success', False)
        return context

    def get_initial(self):
        """Update the initial data to use for forms on this view."""
        default_user = {
            'first_name': '',
            'last_name': '',
            'email': '',
        }
        try:
            default_user.update(self.request.session['b2c_user'])
        except (TypeError, KeyError):
            pass
        initial = super().get_initial()
        initial['first_name'] = default_user['first_name']
        initial['last_name'] = default_user['last_name']
        initial['email'] = default_user['email']
        return initial
