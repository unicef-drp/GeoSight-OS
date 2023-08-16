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
__date__ = '05/07/2023'
__copyright__ = ('Copyright 2023, Unicef')

import json
from json import JSONDecodeError
from typing import List

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

from core.settings.utils import ABS_PATH
from geosight.data.models.indicator import Indicator
from geosight.georepo.models import ReferenceLayerView
from geosight.georepo.models.reference_layer_indicator_value import (
    reference_layer_indicator_values
)
from geosight.importer.attribute import ImporterAttribute
from geosight.importer.exception import ImporterError
from geosight.importer.importers.base import IndicatorValueLongFormat


class FormulaBasedOnOtherIndicatorsIndicatorValue(IndicatorValueLongFormat):
    """Import data other indicator."""

    attributes = {}
    mapping = {}
    html_file = ABS_PATH(
        'geosight', 'importer', 'importers', 'nunjucks', 'django-nunjucks.html'
    )

    @staticmethod
    def attributes_definition(**kwargs) -> List[ImporterAttribute]:
        """Return attributes of the importer."""
        from geosight.importer.attribute import ImporterAttributeInputType
        return IndicatorValueLongFormat.attributes_definition(
            **kwargs) + [
            ImporterAttribute(
                name='selected_indicators',
                input_type=ImporterAttributeInputType.TEXT
            ),
            ImporterAttribute(
                name='expression',
                input_type=ImporterAttributeInputType.TEXT
            ),
        ]

    def check_attributes(self):
        """Check attributes definition."""
        from geosight.importer.importers.base.indicator_value import (
            AdminLevelType
        )
        super().check_attributes()
        admin_level_type = self.get_attribute('admin_level_type')
        if admin_level_type == AdminLevelType.DATA_DRIVEN:
            self.attributes['admin_level_field'] = 'admin_level'
        return None

    def get_records(self) -> List:
        """Get records form upload session.

        Returning records and headers
        """
        selected_indicators = self.attributes.get('selected_indicators', None)
        if not selected_indicators:
            raise ImporterError('No indicators selected.')
        reference_layer_id = self.attributes.get('reference_layer_id', None)
        try:
            reference_layer = ReferenceLayerView.objects.get(
                id=reference_layer_id
            )
        except ReferenceLayerView.DoesNotExist:
            raise ImporterError(
                'Reference layer does not exist.'
            )

        try:
            selected_indicators = json.loads(selected_indicators)
            indicators = Indicator.objects.filter(id__in=selected_indicators)
        except Exception:
            raise ImporterError(
                'Selected indicator configurations is error. '
                'Please reconfigure.'
            )
        expression = self.attributes.get('expression', None)
        if not expression:
            raise ImporterError('Expression is empty.')

        self._update('Fetching data.')
        context = reference_layer_indicator_values(
            reference_layer=reference_layer,
            admin_level=self.attributes.get('admin_level_value', None),
            indicators=indicators
        )

        # TODO:
        #  Change how to get the Nunjucks results without browser
        driver = None
        try:
            records = []
            total = len(context)
            url = f'file://{self.html_file}'
            options = Options()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            driver = webdriver.Chrome(
                service=Service(
                    ChromeDriverManager(version='114.0.5735.90').install()
                ),
                options=options
            )
            for idx, ctx in enumerate(context):
                context = {
                    'context': {
                        'admin_boundary': json.loads(json.dumps(ctx))
                    }
                }
                self._update(
                    f'Processing data {idx + 1}/{total}.',
                    progress=int((idx / total) * 50)
                )
                # TODO:
                #  We need to think about another approach
                driver.get(url)
                driver.execute_script(
                    f"callNunjucks(`{expression}`, `{json.dumps(context)}`);"
                )
                result = driver.find_element(By.ID, 'result')
                try:
                    output = result.text.split(',')
                    if output == '':
                        continue
                    try:
                        time = output[1].strip()
                    except IndexError:
                        time = None
                    if output[0].strip() != '':
                        records.append({
                            "concept_uuid": ctx['concept_uuid'],
                            "geom_code": ctx['geom_code'],
                            "admin_level": ctx['admin_level'],
                            "time": time,
                            "value": output[0].strip()
                        })
                except JSONDecodeError:
                    raise Exception('Expression result is not json.')
            driver.close()
            return records
        except Exception as e:
            print(e)
            if driver:
                driver.close()
            err = f'{e}'
            raise ImporterError(err.split('(Session info:')[0])
