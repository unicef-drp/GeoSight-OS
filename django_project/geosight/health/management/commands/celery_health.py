# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '22/10/2024'
__copyright__ = ('Copyright 2023, Unicef')

from django.core.management.base import BaseCommand
from celery import current_app
import sys


class Command(BaseCommand):
    """Django management command to check Celery worker health."""

    help = 'Check Celery worker health and readiness'

    def add_arguments(self, parser):
        """Add command line arguments for health check type and timeout."""
        parser.add_argument(
            '--check',
            type=str,
            choices=['liveness', 'readiness'],
            required=True,
            help='Type of health check to perform'
        )
        parser.add_argument(
            '--timeout',
            type=int,
            default=5,
            help='Timeout in seconds for the health check'
        )

    def handle(self, *args, **options):
        """Handle the health check command."""
        check_type = options['check']
        timeout = options['timeout']

        try:
            if check_type == 'liveness':
                self.check_liveness(timeout)
            elif check_type == 'readiness':
                self.check_readiness(timeout)

            self.stdout.write(self.style.SUCCESS(f'{check_type} check passed'))
            sys.exit(0)
        except Exception as e:
            self.stderr.write(
                self.style.ERROR(f'{check_type} check failed: {str(e)}')
            )
            sys.exit(1)

    def check_liveness(self, timeout):
        """Check if worker is alive and responding."""
        inspect = current_app.control.inspect(timeout=timeout)
        pong = inspect.ping()

        if not pong:
            raise Exception("No active workers found")

        # pong returns: {'worker@hostname': {'ok': 'pong'}}
        if not any('ok' in response for response in pong.values()):
            raise Exception("Workers not responding properly")

    def check_readiness(self, timeout):
        """Check if worker can connect to broker."""
        conn = current_app.connection()
        conn.ensure_connection(
            max_retries=3,
            interval_start=0,
            interval_step=1,
            timeout=timeout
        )
        conn.release()
