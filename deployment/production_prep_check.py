# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'zakki@kartoza.com'
__date__ = '04/09/23'
__copyright__ = ('Copyright 2023, Unicef')


import sys
import string

from core.settings.prod import *


def production_prep_check():
    print('Checking exposed SSH port')
    dockerfile_path = '/home/web/django_project/Dockerfile'
    prod_check_error = False
    with open(dockerfile_path) as f:
        lines = [
            s.translate({ord(c): None for c in string.whitespace}) for s in f.readlines()
        ]
        dockerfile_prod_end_line = lines.index('#endofprodDockerfile')
        for idx, line in enumerate(lines):
            if line == 'EXPOSE22' and idx < dockerfile_prod_end_line:
                print('SSH port (22) should not be exposed in prod Dockerfile')
                prod_check_error = True

    print('Check development tool (requirements-dev.txt)')
    tool_file_path = '/home/web/django_project/requirements.txt'
    dev_tool_file_path = '/home/web/django_project/requirements-dev.txt'
    tools = set()
    dev_tools = set()
    with open(tool_file_path) as f:
        for line in f.readlines():
            if not line.startswith('#') and line != '\n':
                tools.add(line.split('==')[0])

    with open(dev_tool_file_path) as f:
        for line in f.readlines():
            if not line.startswith('#') and line != '\n':
                dev_tools.add(line.split('==')[0])

    dev_tools_in_prod = dev_tools.intersection(tools)
    if len(dev_tools_in_prod) > 0:
        err_msg = (
            'Development tools/libraries should be removed from production (requirements.txt):\n' +
            '\n'.join(dev_tools_in_prod)
        )
        print(err_msg)
        prod_check_error = True


    print('Checking DEBUG = False')
    if 'DEBUG' in globals():
        if DEBUG:
            print('DEBUG should be False')
            prod_check_error = True

    settings_dev_only = [
        'CRISPY_FAIL_SILENTLY',
        'LOGGING_OUTPUT_ENABLED',
        'LOGGING_LOG_SQL'
    ]
    for setting in settings_dev_only:
        print(f'Checking {setting}')
        if setting in globals():
            print(f'{setting} should not be removed')
            prod_check_error = True

    print('Checking EMAIL_BACKEND')
    if 'EMAIL_BACKEND' in globals():
        if EMAIL_BACKEND != 'django.core.mail.backends.smtp.EmailBackend':
            print(f'EMAIL_BACKEND should be django.core.mail.backends.smtp.EmailBackend')
            prod_check_error = True

    print('Checking WEBPACK_LOADER')
    if 'WEBPACK_LOADER' in globals():
        if os.path.basename(WEBPACK_LOADER['DEFAULT']['STATS_FILE']) != 'webpack-stats.prod.json':
            print(f'Webpack STATS_FILE should be webpack-stats.prod.json')
            prod_check_error = True

    print('Checking TEMPLATES')
    if 'TEMPLATES' in globals():
        if 'debug' in TEMPLATES[0]['OPTIONS']:
            print(f"'debug' should be removed")
            prod_check_error = True

    if prod_check_error:
        sys.exit(1)


if __name__ == "__main__":
    production_prep_check()
