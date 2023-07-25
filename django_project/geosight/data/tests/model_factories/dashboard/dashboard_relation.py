"""Factory for Dashboard Relation Group."""
import factory

from geosight.data.models.dashboard.dashboard_relation import (
    DashboardRelationGroup
)


class DashboardRelationGroupF(factory.django.DjangoModelFactory):
    """Factory for Dashboard Relation Group."""

    class Meta:  # noqa: D106
        model = DashboardRelationGroup
