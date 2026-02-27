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
__date__ = '13/06/2023'
__copyright__ = ('Copyright 2023, Unicef')

import os.path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.gis.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

from core.models.general import (
    SlugTerm, IconTerm, AbstractTerm, AbstractEditData, AbstractVersionData
)
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.indicator import Indicator
from geosight.data.models.related_table import RelatedTable
from geosight.data.utils import update_structure, create_thumbnail
from geosight.georepo.models import ReferenceLayerView
from geosight.permission.models.manager import PermissionManager

# If tenant is enabled, add model limitation
if settings.TENANTS_ENABLED:
    from geosight.tenants.models import BaseModelWithLimitation
else:
    BaseModelWithLimitation = models.Model

User = get_user_model()


class DashboardGroup(AbstractTerm):
    """The group of dashboard."""

    pass


class Dashboard(
    SlugTerm, IconTerm, AbstractEditData, AbstractVersionData,
    BaseModelWithLimitation
):
    """Dashboard model.

    One dashboard just contains one indicator.
    The instance is based on the indicator's.
    The administrative is based on the indicator's.

    Basemap layers and context layers is based on the indicator's instance.
    """

    overview = models.TextField(
        blank=True, null=True
    )
    reference_layer = models.ForeignKey(
        ReferenceLayerView,
        help_text=_('Reference layer.'),
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    extent = models.PolygonField(
        blank=True, null=True,
        help_text=_(
            'Extent of the dashboard. If empty, it is the whole map'
        )
    )
    min_zoom = models.IntegerField(
        null=True, blank=True,
        help_text=_('Minimum zoom level for the dashboard')
    )
    max_zoom = models.IntegerField(
        null=True, blank=True,
        help_text=_('Maximum zoom level for the dashboard')
    )
    geo_field = models.CharField(
        max_length=64,
        default='geometry_code'
    )

    # group
    group = models.ForeignKey(
        DashboardGroup,
        on_delete=models.SET_NULL,
        blank=True, null=True
    )
    objects = models.Manager()
    permissions = PermissionManager()

    # TODO:
    #  This is for temporary old identifier
    dataset_identifier = models.TextField(null=True, blank=True)

    # Layer orders structure
    indicator_layers_structure = models.JSONField(null=True, blank=True)
    context_layers_structure = models.JSONField(null=True, blank=True)
    basemaps_layers_structure = models.JSONField(null=True, blank=True)
    widgets_structure = models.JSONField(null=True, blank=True)
    level_config = models.JSONField(null=True, blank=True, default=dict)

    # ------------------------------
    # Filters
    # ------------------------------
    filters = models.TextField(
        blank=True, null=True
    )
    filters_allow_modify = models.BooleanField(
        default=False
    )
    filters_being_hidden = models.BooleanField(
        default=False
    )

    # ------------------------------
    # Configuration for dashboard
    # ------------------------------
    show_splash_first_open = models.BooleanField(
        null=True, blank=True, default=True,
        help_text=_(
            'Show a splash screen when opening project for the first time'
        )
    )
    truncate_indicator_layer_name = models.BooleanField(
        null=True, blank=True, default=False
    )
    layer_tabs_visibility = models.CharField(
        max_length=64,
        default='indicator_layers,context_layers',
        null=True, blank=True
    )
    default_time_mode = models.JSONField(null=True, blank=True)
    show_map_toolbar = models.BooleanField(
        null=True, blank=True, default=True,
        help_text=_('Show map toolbars on the map.')
    )

    # TransparencySlider
    transparency_config = models.JSONField(
        default={
            'indicatorLayer': 100,
            'contextLayer': 100,
        },
        null=True,
        blank=True
    )

    # Featured
    featured = models.BooleanField(default=False)

    content_limitation_description = 'Limit the number of project items'

    # CACHE
    cache_data = models.JSONField(null=True, blank=True)
    cache_data_generated_at = models.DateTimeField(null=True, blank=True)

    @staticmethod
    def name_is_exist_of_all(slug: str) -> bool:
        """
        Check whether a dashboard with the given slug exists.

        :param slug: The slug to check for existence in the Dashboard model.
        :type slug: str
        :return:
            True if a dashboard with the given slug exists, False otherwise.
        :rtype: bool
        """
        return Dashboard.objects.filter(slug=slug).first() is not None

    @property
    def thumbnail(self):
        """Get dashboard thumbnail if exists."""
        if self.icon.name:
            file_name = os.path.basename(self.icon.name)
            thumbnail_path = os.path.join(
                settings.MEDIA_ROOT,
                'icons',
                'thumbnails',
                file_name
            )
            return thumbnail_path
        return None

    def save(self, *args, **kwargs):  # noqa DOC101
        """Save object and create thumbnail."""
        # If dashboard has icon, delete old thumbnail if exist,
        # save dashboard, then create new thumbnail
        if self.icon.name:
            old_dashboard = Dashboard.objects.filter(id=self.id).first()

            # Delete old thumbnail
            if old_dashboard:
                if old_dashboard.thumbnail:
                    if os.path.exists(old_dashboard.thumbnail):
                        os.remove(old_dashboard.thumbnail)
            # Save dashboard
            super().save(*args, **kwargs)

            # create new thumbnaill
            os.makedirs(os.path.dirname(self.thumbnail), exist_ok=True)
            try:
                create_thumbnail(self.icon.path, self.thumbnail)
            except Exception:
                pass
        else:
            # If it does not have icon, just save*
            super().save(*args, **kwargs)

    def save_relations(self, data, is_create=False):  # noqa DOC202
        """
        Save all related data and relationships for a dashboard instance.

        This method handles saving or updating all the dashboard’s related
        models and configuration, including:

        - Dashboard indicators and their styling rules
        - Widgets and their layout structure
        - Basemaps and their layout structure
        - Context layers and their configuration
        - Related tables and associated fields
        - Permissions

        :param data:
            Dictionary containing all data related to the dashboard's
            relationships, including widgets, indicators, basemaps,
            context layers, related tables, and permissions.
        :type data: dict

        :param is_create:
            Optional flag to indicate if this call is during a
            dashboard creation process. May be used to handle
            initialization-specific logic.
        :type is_create: bool

        :raises ValueError:
            If related table information is invalid or incomplete.

        :return: None
        """
        from geosight.data.models.dashboard import (
            DashboardIndicator, DashboardIndicatorRule, DashboardBasemap,
            DashboardContextLayer, DashboardContextLayerField,
            DashboardIndicatorLayer, DashboardIndicatorLayerIndicator,
            DashboardIndicatorLayerRelatedTable as DSLayerRelatedTable,
            DashboardIndicatorLayerConfig,
            DashboardRelatedTable,
            DashboardIndicatorLayerRule as DSLayerRule,
            DashboardIndicatorLayerIndicatorRule as DSLayerIndicatorRule,
            DashboardIndicatorLayerField as IndicatorLayerField,
            DashboardTool
        )
        from geosight.data.models.style.indicator_style import (
            IndicatorStyleType
        )

        if data.get('permission', None):
            self.permission.update(data['permission'])

        # BASEMAPS
        widgets_new = self.save_widgets(data['widgets'])
        widgets_structure = data['widgets_structure']
        self.widgets_new = update_structure(widgets_structure, widgets_new)

        # INDICATORS
        self.save_relation(
            DashboardIndicator, Indicator, self.dashboardindicator_set.all(),
            data['indicators'])

        # Save styles
        for indicator in data['indicators']:
            try:
                dashboard_indicator = self.dashboardindicator_set.get(
                    object_id=indicator['id'])
                dashboard_indicator.style_config = indicator.get(
                    'style_config', None
                )
                dashboard_indicator.style_type = indicator['style_type']
                dashboard_indicator.override_style = indicator.get(
                    'override_style', False
                )
                dashboard_indicator.dashboardindicatorrule_set.all().delete()
                if dashboard_indicator.override_style:
                    for idx, rule in enumerate(indicator['style']):
                        indicator_rule, created = \
                            DashboardIndicatorRule.objects.get_or_create(
                                object=dashboard_indicator,
                                name=rule['name']
                            )
                        indicator_rule.rule = rule['rule']
                        indicator_rule.color = rule['color']
                        indicator_rule.outline_color = rule['outline_color']
                        indicator_rule.outline_size = rule['outline_size']
                        indicator_rule.active = rule['active']
                        indicator_rule.order = idx
                        indicator_rule.save()
                    dashboard_indicator.style_id = indicator.get(
                        'style_id', None
                    )

                # For label
                dashboard_indicator.override_label = indicator.get(
                    'override_label', False
                )
                dashboard_indicator.label_config = indicator[
                    'label_config'
                ]
                dashboard_indicator.save()
            except KeyError:
                dashboard_indicator.save()
            except DashboardIndicator.DoesNotExist:
                pass

        # BASEMAPS
        basemaps_layers_new = self.save_relation(
            DashboardBasemap, BasemapLayer, self.dashboardbasemap_set.all(),
            data['basemaps_layers'])
        basemaps_layers_structure = data['basemaps_layers_structure']
        self.basemaps_layers_structure = update_structure(
            basemaps_layers_structure, basemaps_layers_new
        )

        # --------------------------------
        # RELATED TABLE
        # --------------------------------
        self.save_relation(
            DashboardRelatedTable, RelatedTable,
            self.dashboardrelatedtable_set.all(),
            data['related_tables'])

        for related_table in data['related_tables']:
            try:
                obj = self.dashboardrelatedtable_set.get(
                    object_id=related_table['id']
                )
                selected_related_fields = related_table.get(
                    'selected_related_fields', []
                )
                selected_related_fields.sort()
                obj.geography_code_field_name = related_table[
                    'geography_code_field_name'
                ]
                obj.geography_code_type = related_table['geography_code_type']
                obj.query = related_table.get('query', None)
                if obj.object.related_fields != selected_related_fields:
                    obj.selected_related_fields = selected_related_fields
                obj.save()
            except DashboardRelatedTable.DoesNotExist:
                raise ValueError(
                    f"Related table with id {related_table['id']} "
                    f"is not found."
                )
            except KeyError as e:
                raise ValueError(
                    f"Related table {obj.object.name} is not configured well. "
                    f"{e} is required."
                )

        # --------------------------------
        # CONTEXT LAYERS
        # --------------------------------
        context_layers_new = self.save_relation(
            DashboardContextLayer, ContextLayer,
            self.dashboardcontextlayer_set.all(),
            data['context_layers'])
        context_layers_structure = data['context_layers_structure']
        self.context_layers_structure = update_structure(
            context_layers_structure, context_layers_new
        )

        # Save fields
        for context_layer in data['context_layers']:
            try:
                dashbaord_context_layer = self.dashboardcontextlayer_set.get(
                    object_id=context_layer['id'])
                dashbaord_context_layer.dashboardcontextlayerfield_set.all(
                ).delete()
                for idx, field in enumerate(context_layer['data_fields']):
                    DashboardContextLayerField.objects.get_or_create(
                        object=dashbaord_context_layer,
                        name=field['name'],
                        alias=field['alias'],
                        visible=field.get('visible', True),
                        as_label=field.get('as_label', False),
                        type=field.get('type', 'string'),
                        order=idx
                    )

            except DashboardContextLayer.DoesNotExist:
                pass

        # --------------------------------
        # INDICATOR LAYERS
        # --------------------------------
        ids = []
        indicator_layers = data['indicator_layers']
        for layer_data in indicator_layers:
            ids.append(layer_data.get('id', 0))
        modelQuery = self.dashboardindicatorlayer_set.all()

        # Remove all not found ids
        modelQuery.exclude(id__in=ids).delete()

        indicator_layers_new = {}
        for idx, layer_data in enumerate(indicator_layers):
            try:
                model = modelQuery.get(id=layer_data.get('id', 0))
            except (KeyError, DashboardIndicatorLayer.DoesNotExist):
                model = DashboardIndicatorLayer(
                    dashboard=self
                )
            model.visible_by_default = layer_data.get(
                'visible_by_default', False
            )
            model.type = layer_data.get('type', 'Single Indicator')
            model.chart_style = layer_data.get('chart_style', {})
            model.level_config = layer_data.get('level_config', {})
            model.popup_template = layer_data.get('popup_template', {})
            model.popup_type = layer_data.get('popup_type', 'Simplified')

            model.raw_data_popup_enable = layer_data.get(
                'raw_data_popup_enable', False
            )
            model.raw_data_popup_config = layer_data.get(
                'raw_data_popup_config', []
            )

            model.dashboardindicatorlayerconfig_set.all().delete()
            model.save()

            # Save it to indicator layers new
            indicator_layers_new[layer_data.get('id', 0)] = model.id
            for key, value in layer_data.get('config', {}).items():
                config, _ = \
                    DashboardIndicatorLayerConfig.objects.get_or_create(
                        layer=model,
                        name=key,
                    )
                config.value = value
                config.save()

            # ------------ INDICATOR LAYER STYLE ---------------
            model.override_style = layer_data.get('override_style', False)
            model.style_type = layer_data.get('style_type', '')
            model.style_id = layer_data.get('style_id', None)
            model.style_config = layer_data.get('style_config', None)

            model.override_label = layer_data.get('override_label', False)
            model.label_config = layer_data.get('label_config', None)

            rules_ids = []
            rules = model.dashboardindicatorlayerrule_set.all()
            layer_data_style = layer_data.get('style', [])
            if isinstance(layer_data_style, list):
                for idx, rule in enumerate(layer_data_style):
                    if 'indicator' in rule:
                        continue
                    _rule, created = DSLayerRule.objects.get_or_create(
                        object=model,
                        name=rule['name']
                    )
                    _rule.rule = rule['rule']
                    _rule.color = rule['color']
                    _rule.outline_color = rule['outline_color']
                    _rule.outline_size = rule['outline_size']
                    _rule.active = rule['active']
                    _rule.order = idx
                    _rule.save()
                    rules_ids.append(_rule.id)
            rules.exclude(id__in=rules_ids).delete()

            # -----------------------------------------------------
            # For fields
            if layer_data['data_fields']:
                objects = model.dashboardindicatorlayerfield_set.exclude(
                    id__in=[
                        field.get('id', 0) for field in
                        layer_data['data_fields']
                    ]
                )
                objects.delete()
                for idx, field in enumerate(layer_data['data_fields']):
                    if is_create:
                        obj, _ = IndicatorLayerField.objects.get_or_create(
                            object=model,
                            id=None
                        )
                    else:
                        obj, _ = IndicatorLayerField.objects.get_or_create(
                            object=model,
                            id=field.get('id', None)
                        )
                    obj.name = field['name']
                    obj.alias = field['alias']
                    obj.visible = field.get('visible', True)
                    obj.as_label = field.get('as_label', False)
                    obj.type = field.get('type', 'string')
                    obj.order = idx
                    obj.save()
            # -----------------------------------------------------
            # This is for indicators
            model.name = layer_data.get('name', '')
            model.description = layer_data.get('description', '')
            model.multi_indicator_mode = layer_data.get(
                'multi_indicator_mode', 'Chart'
            )
            model.save()

            indicatorsQuery = model.dashboardindicatorlayerindicator_set.all()
            ids = []
            for indicator in layer_data['indicators']:
                ids.append(indicator['id'])
            indicatorsQuery.exclude(indicator__id__in=ids).delete()

            for idx, indicator in enumerate(layer_data['indicators']):
                try:
                    layer, created = \
                        DashboardIndicatorLayerIndicator.objects.get_or_create(
                            object=model,
                            indicator=Indicator.objects.get(
                                id=indicator['id']),
                            defaults={
                                'order': idx
                            }
                        )
                    layer.name = indicator['name']
                    layer.color = indicator['color']
                    layer.override_style = indicator.get(
                        'override_style', False
                    )
                    style_type = indicator.get('style_type', '')
                    if not style_type:
                        style_type = IndicatorStyleType.LIBRARY
                    layer.style_type = style_type
                    layer.style_id = indicator.get('style_id', None)
                    layer.style_config = indicator.get('style_config', None)
                    layer.save()

                    rules_ids = []
                    rules = layer.dashboardindicatorlayerindicatorrule_set.all(
                    )
                    style_data = indicator.get('style', [])
                    if not style_data:
                        style_data = []
                    for idx, rule in enumerate(style_data):
                        _rule, _ = DSLayerIndicatorRule.objects.get_or_create(
                            object=layer,
                            name=rule['name']
                        )
                        _rule.rule = rule['rule']
                        _rule.color = rule['color']
                        _rule.outline_color = rule['outline_color']
                        _rule.outline_size = rule['outline_size']
                        _rule.active = rule['active']
                        _rule.order = idx
                        _rule.save()
                        rules_ids.append(_rule.id)
                    rules.exclude(id__in=rules_ids).delete()
                except Indicator.DoesNotExist:
                    pass

            # -----------------------------------------------------
            # This is for related table
            related_tables = layer_data.get('related_tables', [])
            rtQuery = model.dashboardindicatorlayerrelatedtable_set.all()
            ids = []
            for indicator in related_tables:
                ids.append(indicator['id'])
            rtQuery.exclude(related_table__id__in=ids).delete()

            if len(related_tables):
                model.name = layer_data.get('name', '')
                model.description = layer_data.get('description', '')
            model.save()

            for idx, rt in enumerate(related_tables):
                try:
                    layer, created = \
                        DSLayerRelatedTable.objects.get_or_create(
                            object=model,
                            related_table=RelatedTable.objects.get(
                                id=rt['id']),
                            defaults={
                                'order': idx
                            }
                        )
                    layer.save()
                except RelatedTable.DoesNotExist:
                    pass

        indicator_layers_structure = data['indicator_layers_structure']
        self.indicator_layers_structure = update_structure(
            indicator_layers_structure, indicator_layers_new
        )

        # --------------------------------
        # TOOLS
        # --------------------------------
        tools = data.get('tools', [])
        for tool in tools:
            try:
                obj = self.dashboardtool_set.get(name=tool['name'])
            except DashboardTool.DoesNotExist:
                obj = DashboardTool(
                    dashboard=self,
                    name=tool['name'],
                )
            obj.visible_by_default = tool['visible_by_default']
            obj.config = tool.get('config', None)
            obj.save()
        self.save()

    def save_relation(self, ModelClass, ObjectClass, modelQuery, inputData):
        """
        Save or update a dashboard relationship with linked objects.

        This generic method synchronizes the relationship between a dashboard
        and a set of related objects
        (e.g., indicators, basemaps, context layers),
        based on the given input data. It ensures only the specified objects
        are linked and removes others not present in the input.

        :param ModelClass:
            The Django model class representing the intermediate
            relationship (e.g., DashboardIndicator).
        :type ModelClass: django.db.models.Model

        :param ObjectClass:
            The base object class being linked to
            (e.g., Indicator, BasemapLayer).
        :type ObjectClass: django.db.models.Model

        :param modelQuery:
            QuerySet of the current related model instances tied to
            the dashboard.
        :type modelQuery: django.db.models.QuerySet

        :param inputData:
            A list of dictionaries representing the data for each
            object to be saved, including attributes like
            `id`, `visible_by_default`, `styles`, and `configuration`.
        :type inputData: list[dict]

        :raises ValueError:
            If an object with a given ID does not exist in the ObjectClass.

        :return: A dictionary mapping original object IDs to saved object IDs.
        :rtype: dict
        """
        ids = []
        ids_new = {}

        # Remove all not found ids
        for data in inputData:
            ids.append(data.get('id', 0))

        # Remove all not found ids
        modelQuery.exclude(object__id__in=ids).delete()

        for data in inputData:
            try:
                model = ModelClass.objects.get(
                    dashboard=self,
                    object__id=data['id']
                )
            except (KeyError, ModelClass.DoesNotExist):
                try:
                    obj = ObjectClass.objects.get(id=data['id'])
                    model = ModelClass(
                        dashboard=self,
                        object=obj
                    )
                except ObjectClass.DoesNotExist:
                    raise ValueError(
                        f"{ObjectClass.__name__} with id "
                        f"{data['id']} does not exist")

            model.visible_by_default = data.get('visible_by_default', False)
            model.styles = data.get('styles', None)
            model.label_styles = data.get('label_styles', None)

            # Context layer
            model.override_style = data.get('override_style', False)
            model.override_label = data.get('override_label', False)
            model.override_field = data.get('override_field', False)

            # Configuration
            configuration = data.get('configuration', {})
            saved_configuration = {}
            if configuration:
                for key, value in configuration.items():
                    if 'override_' in key:
                        try:
                            k_val = key.replace('override_', '')
                            saved_configuration[k_val] = configuration[k_val]
                            saved_configuration[key] = value
                        except KeyError:
                            pass
            model.configuration = saved_configuration
            model.save()
            ids_new[data.get('id', 0)] = data['id']
        return ids_new

    def save_widgets(self, widget_data):
        """
        Save or update dashboard widgets from the provided data.

        This method performs the following actions:
            - Deletes existing widgets not present in the `widget_data` list.
            - Updates existing widgets based on their ID.
            - Creates new widgets if no valid ID is provided
                or the widget does not exist.
            - Returns a mapping of temporary widget IDs (if any)
                to their new database IDs.

        :param widget_data:
            A list of dictionaries containing widget data.
            Each dict may contain:
                - id (int, optional): Existing widget ID
                - name (str): Widget name
                - description (str): Widget description
                - order (int, optional): Display order
                - visible_by_default (bool): Visibility setting
                - type (str): Widget type
                - config (dict): Configuration options
        :type widget_data: list[dict]

        :return:
            A mapping of original widget IDs (or 0 for new ones)
            to actual saved widget IDs.
        :rtype: dict[int, int]
        """
        from .dashboard_widget import DashboardWidget
        ids = []
        ids_new = {}

        # Remove all not found ids
        for data in widget_data:
            if 'id' in data:
                ids.append(data['id'])

        # Remove all not found ids
        self.dashboardwidget_set.exclude(id__in=ids).delete()

        # Save data
        for data in widget_data:
            try:
                try:
                    widget = self.dashboardwidget_set.get(
                        id=data['id']
                    )
                except (KeyError, DashboardWidget.DoesNotExist):
                    widget = DashboardWidget(dashboard=self)

                widget.name = data['name']
                widget.description = data['description']
                order = data.get('order', 0)
                widget.order = order if order else 0
                widget.visible_by_default = data['visible_by_default']
                widget.type = data['type']

                # This is config
                widget.config = data['config']
                widget.save()
                ids_new[data.get('id', 0)] = widget.id
            except KeyError:
                pass
        return ids_new

    @staticmethod
    def check_data(data, user: User):
        """
        Validate dashboard data based on user permissions.

        Checks if the user has permission to set the featured flag.
        Only administrators are allowed to mark a dashboard as featured.
        Non-admin users attempting to set featured=True will trigger
        a PermissionError.

        :param data: Dictionary containing dashboard data to validate.
        :type data: dict

        :param user: The user attempting to create/update the dashboard.
        :type user: User

        :raises PermissionError: If non-admin user tries to set featured=True.
        """
        # Remove
        try:
            is_admin = user.profile.is_admin
        except AttributeError:
            is_admin = False
        if not is_admin:
            try:
                if data['featured']:
                    raise PermissionError(
                        "Only admins can change the Featured status."
                    )
            except KeyError:
                pass

    def update_cache(self, cache: dict | None):
        """Update dashboard cache data."""

        self.cache_data = cache
        self.cache_data_generated_at = timezone.now()
        self.save(
            update_fields=['cache_data', 'cache_data_generated_at']
        )


_CACHE_ONLY_FIELDS = frozenset({'cache_data', 'cache_data_generated_at'})


@receiver(post_save, sender=Dashboard)
def dashboard_post_save(sender, instance, **kwargs):  # noqa: C901, DOC103
    """Trigger cache invalidation and generation when a dashboard is saved.

    Invalidates all cached permissions for the saved dashboard so they
    are regenerated on next user access, then dispatches an async task
    for any additional cache generation work.

    Skipped when only cache fields (``cache_data``,
    ``cache_data_generated_at``) are updated, to avoid recursive
    invalidation loops.

    :param sender: The model class that sent the signal.
    :type sender: type
    :param instance: The Dashboard instance that was saved.
    :type instance: Dashboard
    :param kwargs: Additional keyword arguments passed by the signal.
    :type kwargs: dict
    """
    update_fields = kwargs.get('update_fields')
    if update_fields and set(update_fields) <= _CACHE_ONLY_FIELDS:
        return

    from geosight.data.tasks.cache import dashboard_cache_generation
    # Regenerate cache permission
    # We delete all cache permissions for this dashboard
    # Regenerate when user access the dashboard
    instance.dashboardcachepermissions_set.all().update(cache=None)

    # Reset cache data
    if instance.cache_data:
        instance.update_cache(None)

    # Run other cache generation
    dashboard_cache_generation.delay(instance.id)
