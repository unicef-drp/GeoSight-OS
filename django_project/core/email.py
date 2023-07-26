"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'irwan@kartoza.com'
__date__ = '26/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

import logging

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from core.models.preferences import SitePreferences

logger = logging.getLogger(__name__)


def send_email_with_html(
        subject: str, recipient_list: list, context: dict, html_path: str
):
    """Send email with html."""
    message = render_to_string(
        html_path,
        context
    )
    try:
        send_mail(
            subject,
            None,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            html_message=message,
            fail_silently=False
        )
    except Exception as e:
        logger.exception(e)


def send_email_to_admins_with_html(
        subject: str, context: dict, html_path: str
):
    """Send email to admins."""
    admin_emails = SitePreferences.preferences().default_admin_emails
    if not admin_emails:
        return
    send_email_with_html(subject, admin_emails, context, html_path)
