"""Factory for Dashboard Relation Group."""
import factory

from geosight.data.models.dashboard.dashboard_relation import (
    DashboardRelationGroup,
    DashboardBasemap,
    DashboardContextLayer,
    DashboardIndicator
)
from geosight.data.tests.model_factories.basemap_layer import BasemapLayerF
from geosight.data.tests.model_factories.context_layers import ContextLayerF
from geosight.data.tests.model_factories.dashboard.dashboard import DashboardF
from geosight.data.tests.model_factories.indicator import IndicatorF


class DashboardRelationGroupF(factory.django.DjangoModelFactory):
    """Factory for Dashboard Relation Group."""

    class Meta:  # noqa: D106
        model = DashboardRelationGroup


class DashboardBasemapF(factory.django.DjangoModelFactory):
    """Factory for DashboardBasemap."""

    dashboard = factory.SubFactory(DashboardF)
    object = factory.SubFactory(BasemapLayerF)

    class Meta:  # noqa: D106
        model = DashboardBasemap


class DashboardContextLayerF(factory.django.DjangoModelFactory):
    """Factory for DashboardContextLayer."""

    dashboard = factory.SubFactory(DashboardF)
    object = factory.SubFactory(ContextLayerF)

    class Meta:  # noqa: D106
        model = DashboardContextLayer


class DashboardIndicatorF(factory.django.DjangoModelFactory):
    """Factory for DashboardIndicator."""

    dashboard = factory.SubFactory(DashboardF)
    object = factory.SubFactory(IndicatorF)

    class Meta:  # noqa: D106
        model = DashboardIndicator
