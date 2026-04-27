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

from django import forms
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from django.forms.models import model_to_dict
from django.utils.translation import gettext_lazy as _

from azure_auth.backends import AzureAuthBackend
from core.models.profile import ROLES_TYPES, ROLES
from patch.auth_user import username_helptext

User = get_user_model()


class AzureAdminForm(forms.ModelForm):
    """Specifically azure admin form."""

    def clean_email(self):
        """Validate and normalise the email field.

        :raises ValidationError: If another user already has the same email.
        :returns: The cleaned, normalised email address.
        :rtype: str
        """
        email = AzureAuthBackend.clean_user_email(
            self.cleaned_data['email']
        )
        if User.objects.exclude(
                id=self.instance.id
        ).filter(email=email).count():
            raise ValidationError(
                "A user with this email already exists."
            )
        return email

    def save(self, commit=True):
        """Save the user instance, syncing username and superuser flag.

        :param commit: Whether to persist the instance to the database.
        :type commit: bool
        :returns: The saved user instance.
        :rtype: django.contrib.auth.models.AbstractUser
        """
        user = super().save(commit=False)
        if settings.USE_AZURE:
            user.username = user.email
        user.is_superuser = user.is_staff
        user.save()
        return user


class AzureAdminUserCreationForm(AzureAdminForm):
    """Admin user create form."""

    class Meta:  # noqa D106
        model = User
        fields = ("email",)


class AzureAdminUserChangeForm(AzureAdminForm):
    """Admin user change form."""

    class Meta:  # noqa D106
        model = User
        fields = '__all__'


class AdminUserChangeForm(UserChangeForm):
    """Admin user change form."""

    username = forms.CharField(
        help_text=username_helptext,
    )


class AzureUserForm(AzureAdminForm):
    """Azure User form."""

    role = forms.ChoiceField(
        label='Role',
        choices=ROLES_TYPES,
        widget=forms.Select()
    )
    is_staff = forms.BooleanField(
        required=False,
        label='Backend admin (Django Staff)',
        help_text=_(
            'Designates whether the user can access '
            'the backend (Django) admin site.'
        )
    )
    receive_notification = forms.BooleanField(
        required=False,
        label='Receive admin notification',
        help_text='Designates whether the user receive notification.'
    )

    def clean_is_staff(self):
        """Restrict staff flag to Super Admin role only.

        :returns:
            The ``is_staff`` value if the role is Super Admin, else False.
        :rtype: bool
        """
        role = self.cleaned_data['role']
        is_staff = self.cleaned_data.get('is_staff', False)
        if role == ROLES.SUPER_ADMIN.name:
            return is_staff
        return False

    class Meta:  # noqa: D106
        model = User
        fields = (
            'first_name', 'last_name', 'email', 'role',
            'is_staff', 'receive_notification'
        )

    @staticmethod
    def model_to_initial(model: User):
        """Return model fields as a dictionary suitable for form.

        :param model: The user instance to convert.
        :type model: django.contrib.auth.models.AbstractUser
        :returns: Dictionary of field values including profile role and
            notification preference.
        :rtype: dict
        """
        initial = model_to_dict(model)
        initial['role'] = model.profile.role
        initial['receive_notification'] = model.profile.receive_notification
        return initial


class NonAzureUserForm(AzureUserForm):
    """User form."""

    username = forms.HiddenInput()

    def clean_username(self):
        """Validate that the username is unique.

        :raises ValidationError: If another user already has the same username.
        :returns: The validated username.
        :rtype: str
        """
        username = self.cleaned_data['username']
        if User.objects.exclude(
                id=self.instance.id).filter(username=username).count():
            raise ValidationError(
                "A user with this username already exists."
            )
        return username

    def clean_is_staff(self):
        """Restrict staff flag to Super Admin role only.

        :returns:
            The ``is_staff`` value if the role is Super Admin, else False.
        :rtype: bool
        """
        role = self.cleaned_data['role']
        is_staff = self.cleaned_data.get('is_staff', False)
        if role == ROLES.SUPER_ADMIN.name:
            return is_staff
        return False

    def clean_password(self):
        """Hash the raw password before saving.

        :returns: The hashed password string.
        :rtype: str
        """
        return make_password(self.cleaned_data['password'])

    class Meta:  # noqa: D106
        model = User
        fields = (
            'first_name', 'last_name', 'username', 'password',
            'email', 'role', 'is_staff',
        )


if settings.USE_AZURE:
    UserForm = AzureUserForm
else:
    UserForm = NonAzureUserForm


class UserEditForm(AzureUserForm):
    """Form for user edit."""

    class Meta:  # noqa: D106
        model = User
        fields = (
            'first_name', 'last_name', 'role', 'email', 'is_staff',
            'receive_notification'
        )

    def __init__(self, *args, **kwargs):  # noqa: DOC101, DOC103
        """Initialise the form, making the email field read-only for Azure.

        :param args: Positional arguments forwarded to the parent.
        :param kwargs: Keyword arguments forwarded to the parent.
        """
        super(UserEditForm, self).__init__(*args, **kwargs)
        if settings.USE_AZURE:
            self.fields['email'].widget.attrs['readonly'] = True


class UserViewerEditForm(AzureAdminForm):
    """Form for user edit."""

    role = forms.ChoiceField(
        label='Role',
        choices=ROLES_TYPES,
        required=False,
        widget=forms.Select()
    )
    receive_notification = forms.BooleanField(
        required=False,
        label='Receive admin notification',
        help_text='Designates whether the user receive notification.'
    )

    class Meta:  # noqa: D106
        model = User
        fields = ('first_name', 'last_name', 'email')

    def __init__(self, *args, **kwargs):  # noqa: DOC101, DOC103
        """Initialise the form, setting email and role fields as read-only.

        :param args: Positional arguments forwarded to the parent.
        :param kwargs: Keyword arguments forwarded to the parent.
        """
        super(UserViewerEditForm, self).__init__(*args, **kwargs)
        if settings.USE_AZURE:
            self.fields['email'].widget.attrs['readonly'] = True
        self.fields['role'].widget.attrs['readonly'] = True

    @staticmethod
    def model_to_initial(model: User):
        """Return model fields as a dictionary suitable for form.

        :param model: The user instance to convert.
        :type model: django.contrib.auth.models.AbstractUser
        :returns: Dictionary of field values including the profile role.
        :rtype: dict
        """
        initial = model_to_dict(model)
        initial['role'] = model.profile.role
        return initial
