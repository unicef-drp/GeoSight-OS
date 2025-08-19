from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from core.tests.base_tests import BaseViewTest
from geosight.data.models.indicator.indicator import Indicator
from geosight.data.models.indicator.indicator_value import IndicatorValue
from geosight.data.tests.model_factories import (
    IndicatorF, IndicatorValueF
)


class IndicatorValueAPITest(BaseViewTest):
    """Test for IndicatorValue API."""

    def setUp(self):
        """To setup test."""
        super().setUp()
        self.indicator = IndicatorF(name='Test Indicator')
        self.entity_name = 'Test Entity'
        
        # Create test data with different dates and values
        self.today = timezone.now().date()
        self.yesterday = self.today - timezone.timedelta(days=1)
        
        # Create values for different dates and entities
        self.values = [
            # Two values for same entity on different dates
            IndicatorValueF(
                indicator=self.indicator,
                entity_name=self.entity_name,
                date=self.today,
                value=100
            ),
            IndicatorValueF(
                indicator=self.indicator,
                entity_name=self.entity_name,
                date=self.yesterday,
                value=50
            ),
            # Value for different entity
            IndicatorValueF(
                indicator=self.indicator,
                entity_name='Different Entity',
                date=self.today,
                value=200
            )
        ]

    def test_group_by_entity_name(self):
        """Test grouping by entity_name."""
        # Test basic grouping
        response = self.client.get(
            f'/api/v1/indicator-value/{self.indicator.id}/values/?fields=entity_name,value'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)  # Two unique entities
        
        # Verify entity names are present
        entity_names = [item['entity_name'] for item in data]
        self.assertIn(self.entity_name, entity_names)
        self.assertIn('Different Entity', entity_names)

    def test_group_by_entity_name_with_frequency(self):
        """Test grouping by entity_name with frequency."""
        # Test with daily frequency
        response = self.client.get(
            f'/api/v1/indicator-value/{self.indicator.id}/values/?'
            f'fields=entity_name,value,date&frequency=daily'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 3)  # Three unique date-entity combinations
        
        # Verify we get values for both dates
        dates = [item['date'] for item in data]
        self.assertIn(str(self.today), dates)
        self.assertIn(str(self.yesterday), dates)

    def test_group_by_entity_name_with_other_fields(self):
        """Test grouping by entity_name with other fields."""
        response = self.client.get(
            f'/api/v1/indicator-value/{self.indicator.id}/values/?'
            f'fields=entity_name,value,date,indicator_id'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify all fields are present
        for item in data:
            self.assertIn('entity_name', item)
            self.assertIn('value', item)
            self.assertIn('date', item)
            self.assertIn('indicator_id', item)
            self.assertEqual(item['indicator_id'], self.indicator.id)

    def test_group_by_entity_name_with_empty_value(self):
        """Test grouping with empty entity_name."""
        # Create value with empty entity_name
        empty_value = IndicatorValueF(
            indicator=self.indicator,
            entity_name='',
            date=self.today,
            value=300
        )
        
        response = self.client.get(
            f'/api/v1/indicator-value/{self.indicator.id}/values/?'
            f'fields=entity_name,value'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 3)  # Three unique entities including empty
        
        # Verify empty entity_name is present
        entity_names = [item['entity_name'] for item in data]
        self.assertIn('', entity_names)

    def test_group_by_entity_name_with_special_chars(self):
        """Test grouping with special characters in entity_name."""
        # Create value with special characters
        special_value = IndicatorValueF(
            indicator=self.indicator,
            entity_name='Test Entity!@#$%^&*()',
            date=self.today,
            value=400
        )
        
        response = self.client.get(
            f'/api/v1/indicator-value/{self.indicator.id}/values/?'
            f'fields=entity_name,value'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify special characters are preserved
        entity_names = [item['entity_name'] for item in data]
        self.assertIn('Test Entity!@#$%^&*()', entity_names)

    def test_group_by_entity_name_with_multiple_indicators(self):
        """Test grouping with multiple indicators."""
        # Create another indicator and value
        indicator2 = IndicatorF(name='Test Indicator 2')
        value2 = IndicatorValueF(
            indicator=indicator2,
            entity_name=self.entity_name,
            date=self.today,
            value=150
        )
        
        # Test grouping by entity_name across indicators
        response = self.client.get(
            f'/api/v1/indicator-value/{self.indicator.id}/values/?'
            f'fields=entity_name,value,indicator_id'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify we only get values for the specified indicator
        for item in data:
            self.assertEqual(item['indicator_id'], self.indicator.id)

    def test_invalid_frequency(self):
        """Test invalid frequency parameter."""
        response = self.client.get(
            f'/api/v1/indicator-value/{self.indicator.id}/values/?'
            f'fields=entity_name,value&frequency=invalid'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('frequency invalid is not recognized', str(response.content))
