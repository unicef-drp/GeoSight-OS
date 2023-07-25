"""Factory for DashboardIndicatorLayer."""
import factory

from geosight.data.models.dashboard.dashboard_indicator_layer import (
    DashboardIndicatorLayer, DashboardIndicatorLayerRelatedTable,
    DashboardIndicatorLayerConfig, DashboardIndicatorLayerIndicator
)
from geosight.data.tests.model_factories.indicator.indicator import IndicatorF
from geosight.data.tests.model_factories.dashboard.dashboard import DashboardF
from geosight.data.tests.model_factories.dashboard.dashboard_relation import (
    DashboardRelationGroupF
)
from geosight.data.tests.model_factories.related_table import RelatedTableF


class DashboardIndicatorLayerF(factory.django.DjangoModelFactory):
    """Factory for Dashboard Indicator Layer."""

    dashboard = factory.SubFactory(DashboardF)
    relation_group = factory.SubFactory(DashboardRelationGroupF)
    name = factory.Sequence(lambda n: 'DashboardIndicatorLayer {}'.format(n))

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayer


class DashboardIndicatorLayerRelatedTableF(factory.django.DjangoModelFactory):
    """Factory for Dashboard Indicator Layer Related Table."""

    object = factory.SubFactory(DashboardIndicatorLayer)
    related_table = factory.SubFactory(RelatedTableF)
    name = factory.Sequence(
        lambda n: 'DashboardIndicatorLayerRelatedTable {}'.format(n)
    )

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerRelatedTable


class DashboardIndicatorLayerConfigF(factory.django.DjangoModelFactory):
    """Factory for Dashboard Indicator Layer Config."""

    layer = factory.SubFactory(DashboardIndicatorLayerF)
    name = factory.Sequence(
        lambda n: 'DashboardIndicatorLayerConfig {}'.format(n)
    )
    value = factory.Sequence(
        lambda n: 'DashboardIndicatorLayerConfig {}'.format(n)
    )

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerConfig


class DashboardIndicatorLayerIndicatorF(factory.django.DjangoModelFactory):
    """Factory for Dashboard Indicator Layer Indicator."""

    indicator = factory.SubFactory(IndicatorF)
    object = factory.SubFactory(DashboardIndicatorLayerF)

    class Meta:  # noqa: D106
        model = DashboardIndicatorLayerIndicator
