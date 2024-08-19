"""Test for Indicator Layer."""
from datetime import date, datetime
from unittest.mock import patch

from core.tests.base_tests import TenantTestCase as TestCase
from django.utils import timezone

from geosight.data.models.related_table import RelatedTable
from geosight.data.tests.model_factories import (
    DashboardIndicatorLayerF, DashboardIndicatorLayerRelatedTableF,
    DashboardRelatedTableF, DashboardIndicatorLayerConfigF,
    DashboardIndicatorLayerIndicatorF
)
from geosight.data.tests.model_factories.indicator import IndicatorValueF


class TestIndicatorLayer(TestCase):
    """.Test for Indicator Layer model."""

    def setUp(self) -> None:  # noqa: D102
        self.d_ind_layer = DashboardIndicatorLayerF.create()

    @patch.object(RelatedTable, 'data_with_query', autospec=True)
    def test_last_update_as_related_table(self, mock_data_with_query):
        """Test get last update if Indicator Layer type is Related Table."""
        dashboard = self.d_ind_layer.dashboard
        relation_group = self.d_ind_layer.relation_group
        dil_rlt_table = DashboardIndicatorLayerRelatedTableF.create(
            object=self.d_ind_layer
        )
        DashboardRelatedTableF.create(
            dashboard=dashboard,
            object=dil_rlt_table.related_table,
            relation_group=relation_group
        )
        date_field = DashboardIndicatorLayerConfigF.create(
            layer=self.d_ind_layer, name='date_field', value='datum'
        )
        DashboardIndicatorLayerConfigF.create(
            layer=self.d_ind_layer, name='date_format', value='%Y-%m-%d'
        )
        mock_data_with_query.return_value = [
            {date_field.value: '2023-02-01T00:00:00+00:00'},
            {date_field.value: '2023-02-20T00:00:00+00:00'},
            {date_field.value: '2023-01-01T00:00:00+00:00'}
        ], False

        self.assertEquals(
            self.d_ind_layer.last_update,
            timezone.make_aware(datetime(2023, 2, 20))
        )

    def test_last_update_as_non_related_table(self):
        """Test get last update if Indicator Layer type is not Related Table."""  # noqa: E501
        dil_indicator = DashboardIndicatorLayerIndicatorF.create(
            object=self.d_ind_layer
        )
        dates = [date(2022, 2, 1), date(2022, 2, 20), datetime(2022, 1, 1)]
        for dt in dates:
            IndicatorValueF.create(
                indicator=dil_indicator.indicator,
                date=dt
            )

        self.assertEquals(
            self.d_ind_layer.last_update, '2022-02-20T00:00:00+00:00'
        )
