"""Factory for Dashboard Related Table."""
import factory

from geosight.data.models.dashboard.dashboard_related_table import (
    DashboardRelatedTable
)
from geosight.data.tests.model_factories.dashboard.dashboard import DashboardF
from geosight.data.tests.model_factories.dashboard.dashboard_relation import (
    DashboardRelationGroupF
)
from geosight.data.tests.model_factories.related_table import RelatedTableF


class DashboardRelatedTableF(factory.django.DjangoModelFactory):
    """Factory for Dashboard Related Table."""

    dashboard = factory.SubFactory(DashboardF)
    object = factory.SubFactory(RelatedTableF)
    relation_group = factory.SubFactory(DashboardRelationGroupF)
    geography_code_type = factory.Sequence(
        lambda n: 'geo_code_type {}'.format(n)
    )
    geography_code_field_name = factory.Sequence(
        lambda n: 'geo_code_field_name {}'.format(n)
    )

    class Meta:  # noqa: D106
        model = DashboardRelatedTable
