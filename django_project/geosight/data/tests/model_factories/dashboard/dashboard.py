"""Factory for Dashboard."""
import factory

from geosight.georepo.tests.model_factories.reference_layer import (
    ReferenceLayerF
)
from geosight.data.models.dashboard import Dashboard, DashboardGroup


class DashboardGroupF(factory.django.DjangoModelFactory):
    """Factory for Dashboard Group."""

    name = factory.Sequence(lambda n: 'Dashboard Group {}'.format(n))

    class Meta:  # noqa: D106
        model = DashboardGroup


class DashboardF(factory.django.DjangoModelFactory):
    """Factory for Dashboard."""

    reference_layer = factory.SubFactory(ReferenceLayerF)
    name = factory.Sequence(lambda n: 'Dashboard {}'.format(n))
    group = factory.SubFactory(DashboardGroupF)

    class Meta:  # noqa: D106
        model = Dashboard
