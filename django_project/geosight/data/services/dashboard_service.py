# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

Shared dashboard create, config and update flow.

Used by the v1 REST API (create, config, update) and by the admin create view.
The payload shape is the same everywhere: top-level dashboard settings plus a
``data`` object with the layers, widgets, filters and tools. The config
endpoint returns exactly this shape, so a client can read it, change it and
send it back.
"""

import copy
import json
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.dateparse import parse_datetime
from django.utils.translation import gettext as _

from geosight.data.forms.dashboard import DashboardForm
from geosight.data.models.basemap_layer import BasemapLayer
from geosight.data.models.context_layer import ContextLayer
from geosight.data.models.dashboard import Dashboard
from geosight.data.models.indicator import Indicator
from geosight.data.models.related_table import RelatedTable
from geosight.data.models.style.indicator_style import IndicatorStyleType
from geosight.georepo.models import ReferenceLayerView

logger = logging.getLogger(__name__)
User = get_user_model()

INTERNAL_CREATE_ERROR = (
    'Unable to create dashboard due to an internal error.'
)
INTERNAL_UPDATE_ERROR = (
    'Unable to update dashboard due to an internal error.'
)

# Settings that the dashboard form reads from the top level of the payload.
# They are also accepted inside ``data`` (that is where GET /data has them).
TOP_LEVEL_SETTINGS = [
    'name', 'slug', 'description', 'overview', 'group', 'geoField',
    'featured', 'show_splash_first_open', 'truncate_indicator_layer_name',
    'layer_tabs_visibility', 'default_time_mode', 'show_map_toolbar',
    'transparency_config'
]

# Keys of ``data`` returned by the config endpoint and accepted by
# create and update.
DATA_KEYS = [
    'reference_layer', 'level_config', 'extent', 'min_zoom', 'max_zoom',
    'indicators', 'indicator_layers', 'indicator_layers_structure',
    'context_layers', 'context_layers_structure',
    'basemaps_layers', 'basemaps_layers_structure',
    'related_tables', 'widgets', 'widgets_structure', 'tools',
    'filters', 'filters_allow_modify', 'filters_being_hidden',
    'auto_zoom_to_filter'
]

LIST_KEYS = [
    'indicators', 'indicator_layers', 'context_layers', 'basemaps_layers',
    'related_tables', 'widgets', 'tools'
]
STRUCTURES = {
    'indicator_layers_structure': 'indicator_layers',
    'context_layers_structure': 'context_layers',
    'basemaps_layers_structure': 'basemaps_layers',
    'widgets_structure': 'widgets',
}
STYLE_RULE_KEYS = [
    'name', 'rule', 'color', 'outline_color', 'outline_size', 'active'
]

# Form fields that the update keeps from the saved dashboard when the
# payload does not send them.
KEEP_ON_UPDATE = [
    'dataset_identifier', 'creator_username', 'modified_by_username'
]


class DashboardPayloadError(Exception):
    """The payload is not a valid dashboard config."""

    def __init__(self, errors: List[Dict]):  # noqa: DOC101,DOC103
        """Init with a list of {field, message} errors."""
        self.errors = errors
        super().__init__(self.detail)

    @property
    def detail(self) -> str:
        """Return all errors as one readable line.

        :return: The joined error messages.
        :rtype: str
        """
        return '; '.join(
            f"{error['field']}: {error['message']}" if error['field']
            else error['message']
            for error in self.errors
        )


class DashboardSharePermissionError(Exception):
    """The user sent a permission block without share permission."""


class DashboardConflictError(Exception):
    """The dashboard was saved by someone else since the client read it."""


@dataclass
class DashboardCreateResult:
    """Container for the dashboard create flow output."""

    dashboard: Optional[Dashboard] = None
    error: Optional[str] = None
    form_errors: Optional[Dict] = None
    errors: List[Dict] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Payload helpers
# ---------------------------------------------------------------------------
def _required():
    """Return the translated 'required' message.

    :return: The message.
    :rtype: str
    """
    return _('This field is required.')


def _parse_data(payload: dict) -> dict:
    """Return the ``data`` object of the payload as a dict.

    :param payload: Incoming payload.
    :type payload: dict
    :return: The parsed ``data`` object.
    :rtype: dict
    :raises DashboardPayloadError: If ``data`` is missing or not an object.
    """
    if payload.get('data') in [None, '']:
        raise DashboardPayloadError(
            [{'field': 'data', 'message': _required()}]
        )
    data = payload['data']
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except ValueError:
            raise DashboardPayloadError(
                [{'field': 'data', 'message': _('Must be valid JSON.')}]
            )
    if not isinstance(data, dict):
        raise DashboardPayloadError(
            [{'field': 'data', 'message': _('Must be an object.')}]
        )
    return data


def normalize_payload(payload: dict) -> dict:
    """Bring a payload into the shape the dashboard form expects.

    - ``data`` is parsed when it is a JSON string (multipart requests);
    - top-level settings sent inside ``data`` (where GET /data has them)
      are moved to the top level, unless the top level already has them;
    - ``geo_field`` is accepted as an alias of ``geoField``;
    - ``reference_layer`` may be the object returned by GET /data.

    :param payload: Incoming payload.
    :type payload: dict
    :return: A new, normalized payload with ``data`` as a dict.
    :rtype: dict
    """
    payload = dict(payload)
    data = dict(_parse_data(payload))
    if 'geo_field' in payload and 'geoField' not in payload:
        payload['geoField'] = payload.pop('geo_field')
    if 'geo_field' in data and 'geoField' not in data:
        data['geoField'] = data.pop('geo_field')
    for key in TOP_LEVEL_SETTINGS:
        if key in data:
            value = data.pop(key)
            if key not in payload:
                payload[key] = value
    reference_layer = data.get('reference_layer')
    if isinstance(reference_layer, dict):
        data['reference_layer'] = reference_layer.get('identifier')
    payload['data'] = data
    return payload


def _root_structure(items) -> dict:
    """Return a flat layer structure that lists every item id.

    :param items: List of items with ids.
    :type items: list
    :return: A structure with all ids as children of the root group.
    :rtype: dict
    """
    return {
        'id': 'root',
        'group': '',
        'children': [
            item['id'] for item in items
            if isinstance(item, dict) and 'id' in item
        ]
    }


def apply_create_defaults(data: dict):
    """Fill optional ``data`` keys for a new dashboard.

    Lists default to empty and structures to a flat list of the items, so a
    minimal payload only needs ``reference_layer`` and ``extent``.

    :param data: The ``data`` object, changed in place.
    :type data: dict
    """
    for key in LIST_KEYS:
        if data.get(key) is None:
            data[key] = []
    for structure, list_key in STRUCTURES.items():
        if data.get(structure) is None:
            items = data[list_key] if isinstance(data[list_key], list) else []
            data[structure] = _root_structure(items)
    if data.get('filters') is None:
        data['filters'] = {}


def _check_style_rules(rules, path: str, errors: list):  # noqa: DOC201
    """Check that every style rule has the keys the save code needs.

    Only a list of rules is saved; any other value (the editor sends one
    for some layer types) is ignored by the save code, so it is not an
    error here either.

    :param rules: The style rules.
    :type rules: list
    :param path: Field path used in error messages.
    :type path: str
    :param errors: Error list, changed in place.
    :type errors: list
    """
    if not isinstance(rules, list):
        return
    for idx, rule in enumerate(rules):
        if not isinstance(rule, dict):
            errors.append({
                'field': f'{path}[{idx}]', 'message': _('Must be an object.')
            })
            continue
        if 'indicator' in rule:
            continue
        for key in STYLE_RULE_KEYS:
            if key not in rule:
                errors.append({
                    'field': f'{path}[{idx}].{key}', 'message': _required()
                })


def _check_fields(fields, path: str, errors: list):  # noqa: DOC201
    """Check data_fields entries (name and alias are required).

    :param fields: The data fields.
    :type fields: list
    :param path: Field path used in error messages.
    :type path: str
    :param errors: Error list, changed in place.
    :type errors: list
    """
    if not fields:
        return
    if not isinstance(fields, list):
        errors.append({'field': path, 'message': _('Must be a list.')})
        return
    for idx, item in enumerate(fields):
        for key in ['name', 'alias']:
            if not isinstance(item, dict) or key not in item:
                errors.append({
                    'field': f'{path}[{idx}].{key}', 'message': _required()
                })


def _missing_ids(model, ids) -> set:
    """Return the ids that have no row in the model's table.

    :param model: Model class.
    :type model: django.db.models.Model
    :param ids: Ids to check.
    :type ids: iterable
    :return: The ids without a row.
    :rtype: set
    """
    ids = {_id for _id in ids if isinstance(_id, int)}
    if not ids:
        return set()
    found = set(model.objects.filter(id__in=ids).values_list('id', flat=True))
    return ids - found


def _does_not_exist(label: str, _id) -> str:
    """Return the translated 'does not exist' message.

    :param label: Translated object label.
    :type label: str
    :param _id: The id that was not found.
    :type _id: int
    :return: The message.
    :rtype: str
    """
    return _('%(model)s %(id)s does not exist.') % {
        'model': label, 'id': _id
    }


def _check_reference_layer(  # noqa: DOC201,DOC501,DOC503
        identifier: str, errors: list
):
    """Check that the reference layer exists, locally or in GeoRepo.

    An unknown identifier is looked up once, the same way the form does. If
    that fails or returns no name, the new row is rolled back and an error
    is reported, instead of a server error or a dashboard with a broken
    reference layer.

    :param identifier: Reference layer identifier.
    :type identifier: str
    :param errors: Error list, changed in place.
    :type errors: list
    """
    if ReferenceLayerView.objects.filter(identifier=identifier).exists():
        return
    try:
        with transaction.atomic():
            view = ReferenceLayerView(identifier=identifier)
            view.save()
            if not view.name:
                raise ValueError('Reference layer has no name.')
    except Exception as e:
        logger.info(f'Reference layer {identifier} lookup failed: {e}')
        errors.append({
            'field': 'data.reference_layer',
            'message': _(
                'Reference layer %(identifier)s was not found.'
            ) % {'identifier': identifier}
        })


def _check_shape(data: dict, errors: list):
    """Check the top-level keys and types of ``data``.

    :param data: The ``data`` object.
    :type data: dict
    :param errors: Error list, changed in place.
    :type errors: list
    """
    def add(path, message):
        errors.append({'field': path, 'message': message})

    extent = data.get('extent')
    if extent is None:
        add('data.extent', _required())
    elif (
            not isinstance(extent, (list, tuple)) or len(extent) != 4 or
            not all(
                isinstance(value, (int, float)) and
                not isinstance(value, bool) for value in extent
            )
    ):
        add(
            'data.extent',
            _('Must be a list of 4 numbers: [min longitude, min latitude, '
              'max longitude, max latitude].')
        )
    # An empty identifier is allowed (a dashboard without a reference
    # layer, e.g. a duplicate of one); a missing key is not.
    reference_layer = data.get('reference_layer')
    if reference_layer is None:
        add('data.reference_layer', _required())
    elif not isinstance(reference_layer, str):
        add('data.reference_layer', _('Must be the identifier as a string.'))

    for key in LIST_KEYS:
        if key not in data:
            add(f'data.{key}', _required())
        elif not isinstance(data[key], list):
            add(f'data.{key}', _('Must be a list.'))
    for key in STRUCTURES:
        if key not in data:
            add(f'data.{key}', _required())
        elif not isinstance(data[key], dict):
            add(f'data.{key}', _('Must be an object.'))
    for key in ['indicator_layers_structure', 'context_layers_structure',
                'basemaps_layers_structure']:
        if isinstance(data.get(key), dict) and not data[key]:
            add(f'data.{key}', _('Must not be empty.'))
    if 'filters' not in data:
        add('data.filters', _required())
    elif not isinstance(data['filters'], (dict, list, str, type(None))):
        add('data.filters', _('Must be an object.'))


def _check_list_ids(data: dict, key: str, model, label: str, errors: list):
    """Check the ids of a list of items against a model.

    :param data: The ``data`` object.
    :type data: dict
    :param key: The list key in ``data``.
    :type key: str
    :param model: Model the ids refer to.
    :type model: django.db.models.Model
    :param label: Translated object label for messages.
    :type label: str
    :param errors: Error list, changed in place.
    :type errors: list
    """
    ids = []
    for idx, item in enumerate(data[key]):
        if not isinstance(item, dict):
            errors.append({
                'field': f'data.{key}[{idx}]',
                'message': _('Must be an object.')
            })
            continue
        if not isinstance(item.get('id'), int):
            errors.append({
                'field': f'data.{key}[{idx}].id',
                'message': _('Must be an integer id.')
            })
            continue
        ids.append((idx, item['id']))
    missing = _missing_ids(model, [_id for _, _id in ids])
    for idx, _id in ids:
        if _id in missing:
            errors.append({
                'field': f'data.{key}[{idx}].id',
                'message': _does_not_exist(label, _id)
            })


def _check_indicator_layers(data: dict, errors: list):
    """Check indicator layers, their indicators and related tables.

    :param data: The ``data`` object.
    :type data: dict
    :param errors: Error list, changed in place.
    :type errors: list
    """
    def add(path, message):
        errors.append({'field': path, 'message': message})

    layer_ids = []
    indicators = []
    related_tables = []
    for idx, layer in enumerate(data['indicator_layers']):
        path = f'data.indicator_layers[{idx}]'
        if not isinstance(layer, dict):
            add(path, _('Must be an object.'))
            continue
        if not isinstance(layer.get('id'), int):
            add(
                f'{path}.id',
                _('Must be an integer id. Use the id from the config to '
                  'keep a layer, or any unused number for a new layer.')
            )
        elif layer['id'] in layer_ids:
            add(f'{path}.id', _('Duplicate id.'))
        else:
            layer_ids.append(layer['id'])
        layer.setdefault('data_fields', None)
        _check_fields(layer['data_fields'], f'{path}.data_fields', errors)
        _check_style_rules(layer.get('style'), f'{path}.style', errors)
        layer_indicators = layer.setdefault('indicators', [])
        if not isinstance(layer_indicators, list):
            add(f'{path}.indicators', _('Must be a list.'))
            layer_indicators = []
        for ind_idx, indicator in enumerate(layer_indicators):
            ind_path = f'{path}.indicators[{ind_idx}]'
            if not isinstance(indicator, dict) or not isinstance(
                    indicator.get('id'), int
            ):
                add(f'{ind_path}.id', _('Must be an integer id.'))
                continue
            indicators.append((ind_path, indicator))
            _check_style_rules(
                indicator.get('style'), f'{ind_path}.style', errors
            )
        tables = layer.get('related_tables') or []
        if not isinstance(tables, list):
            add(f'{path}.related_tables', _('Must be a list.'))
            tables = []
        for rt_idx, table in enumerate(tables):
            rt_path = f'{path}.related_tables[{rt_idx}]'
            if not isinstance(table, dict) or not isinstance(
                    table.get('id'), int
            ):
                add(f'{rt_path}.id', _('Must be an integer id.'))
                continue
            related_tables.append((rt_path, table['id']))

    names = dict(
        Indicator.objects.filter(
            id__in=[indicator['id'] for _, indicator in indicators]
        ).values_list('id', 'name')
    )
    for ind_path, indicator in indicators:
        if indicator['id'] not in names:
            add(
                f'{ind_path}.id',
                _does_not_exist(_('Indicator'), indicator['id'])
            )
            continue
        indicator.setdefault('name', names[indicator['id']])
        indicator.setdefault('color', '#000000')
    missing = _missing_ids(RelatedTable, [_id for _, _id in related_tables])
    for rt_path, _id in related_tables:
        if _id in missing:
            add(f'{rt_path}.id', _does_not_exist(_('Related table'), _id))


def validate_data(data: dict):
    """Validate ``data`` and report every problem with its field path.

    Checks the keys the save code needs and that every referenced indicator,
    basemap, context layer and related table exists, so nothing is dropped
    silently. Fills harmless defaults (names, colours, flags) in place.

    :param data: The ``data`` object.
    :type data: dict
    :raises DashboardPayloadError: When at least one problem is found.
    """
    errors = []
    _check_shape(data, errors)
    if errors:
        raise DashboardPayloadError(errors)

    _check_list_ids(data, 'indicators', Indicator, _('Indicator'), errors)
    _check_list_ids(
        data, 'basemaps_layers', BasemapLayer, _('Basemap'), errors
    )
    _check_list_ids(
        data, 'context_layers', ContextLayer, _('Context layer'), errors
    )
    _check_list_ids(
        data, 'related_tables', RelatedTable, _('Related table'), errors
    )

    for idx, indicator in enumerate(data['indicators']):
        if isinstance(indicator, dict):
            if not indicator.get('style_type'):
                indicator['style_type'] = IndicatorStyleType.LIBRARY
            indicator.setdefault('label_config', None)
            if indicator.get('override_style'):
                _check_style_rules(
                    indicator.get('style'),
                    f'data.indicators[{idx}].style', errors
                )

    for idx, layer in enumerate(data['context_layers']):
        if isinstance(layer, dict):
            if layer.get('data_fields') is None:
                layer['data_fields'] = []
            _check_fields(
                layer['data_fields'],
                f'data.context_layers[{idx}].data_fields', errors
            )

    for idx, table in enumerate(data['related_tables']):
        if isinstance(table, dict):
            for key in ['geography_code_field_name', 'geography_code_type']:
                if key not in table:
                    errors.append({
                        'field': f'data.related_tables[{idx}].{key}',
                        'message': _required()
                    })

    _check_indicator_layers(data, errors)

    widget_ids = []
    for idx, widget in enumerate(data['widgets']):
        path = f'data.widgets[{idx}]'
        if not isinstance(widget, dict):
            errors.append({'field': path, 'message': _('Must be an object.')})
            continue
        if 'id' in widget:
            if widget['id'] in widget_ids:
                errors.append({
                    'field': f'{path}.id', 'message': _('Duplicate id.')
                })
            widget_ids.append(widget['id'])
        for key in ['name', 'type']:
            if not widget.get(key):
                errors.append({
                    'field': f'{path}.{key}', 'message': _required()
                })
        if not isinstance(widget.get('config'), dict):
            errors.append({
                'field': f'{path}.config', 'message': _('Must be an object.')
            })
        widget.setdefault('description', '')
        widget.setdefault('visible_by_default', True)

    for idx, tool in enumerate(data['tools']):
        if not isinstance(tool, dict) or not tool.get('name'):
            errors.append({
                'field': f'data.tools[{idx}].name', 'message': _required()
            })
            continue
        tool.setdefault('visible_by_default', True)

    if errors:
        raise DashboardPayloadError(errors)

    if data['reference_layer']:
        _check_reference_layer(data['reference_layer'], errors)
    if errors:
        raise DashboardPayloadError(errors)


def _prepare_form_data(payload: dict, user: User) -> dict:
    """Run the shared dashboard form preparation.

    :param payload: Normalized and validated payload.
    :type payload: dict
    :param user: The user saving the dashboard.
    :type user: User
    :return: The data for DashboardForm and save_relations.
    :rtype: dict
    :raises DashboardPayloadError: If the form preparation fails.
    """
    try:
        return DashboardForm.update_data(payload, user=user)
    except PermissionError as e:
        raise DashboardPayloadError([{'field': 'featured', 'message': str(e)}])
    except ValueError as e:
        raise DashboardPayloadError([{'field': 'data', 'message': str(e)}])
    except KeyError as e:
        raise DashboardPayloadError(
            [{'field': f'data.{e.args[0]}', 'message': _required()}]
        )


def _slug_taken_error(slug: str) -> DashboardPayloadError:
    """Return the error for a slug that is already used.

    :param slug: The slug.
    :type slug: str
    :return: The error.
    :rtype: DashboardPayloadError
    """
    return DashboardPayloadError([{
        'field': 'slug',
        'message': _(
            'Dashboard with this url shortcode : %(slug)s is exist. '
            'Please choose other url shortcode.'
        ) % {'slug': slug}
    }])


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------
def create_dashboard_from_payload(  # noqa: DOC501,DOC503
        payload: dict, user: User, files
) -> DashboardCreateResult:
    """
    Create a dashboard using the shared UI/API creation flow.

    :param payload: Incoming payload from UI or API request.
    :type payload: dict
    :param user: Authenticated user creating the dashboard.
    :type user: User
    :param files: Uploaded files dictionary.
    :type files: MultiValueDict or dict
    :return: The result containing a dashboard or error details.
    :rtype: DashboardCreateResult
    """
    try:
        payload = normalize_payload(payload)
        apply_create_defaults(payload['data'])
        validate_data(payload['data'])
        data = _prepare_form_data(payload, user)
        if Dashboard.name_is_exist_of_all(data['slug']):
            raise _slug_taken_error(data['slug'])
    except DashboardPayloadError as e:
        return DashboardCreateResult(error=e.detail, errors=e.errors)

    origin = None
    origin_id = data.get('origin_id', None)
    if origin_id:
        try:
            origin = Dashboard.objects.get(id=origin_id)
        except (Dashboard.DoesNotExist, ValueError):
            return DashboardCreateResult(
                error=_('Origin project is not found.')
            )

    data['creator'] = user
    data['modified_by'] = user
    form = DashboardForm(data, files)
    if not form.is_valid():
        return DashboardCreateResult(form_errors=dict(form.errors.items()))

    try:
        with transaction.atomic():
            dashboard = form.save()
            if origin:
                dashboard.icon = origin.icon
                dashboard.save()
            dashboard.save_relations(data, user=user, is_create=True)
            dashboard.increase_version()
            return DashboardCreateResult(dashboard=dashboard)
    except Exception:
        logger.exception('Dashboard create failed.')
        return DashboardCreateResult(error=_(INTERNAL_CREATE_ERROR))


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
def dashboard_config(dashboard: Dashboard) -> dict:
    """Return the full config of a dashboard in the create/update shape.

    Sharing (``permission``) is not part of the config, so sending the
    config back never changes who can access the dashboard.

    :param dashboard: The dashboard.
    :type dashboard: Dashboard
    :return: Top-level settings, ``modified_at`` and ``data``.
    :rtype: dict
    """
    from geosight.data.serializer.dashboard import DashboardSerializer
    serialized = DashboardSerializer(dashboard).data
    config = {}
    for key in TOP_LEVEL_SETTINGS:
        source = 'geo_field' if key == 'geoField' else key
        config[key] = copy.deepcopy(serialized.get(source))
    config['modified_at'] = (
        dashboard.modified_at.isoformat() if dashboard.modified_at else None
    )
    data = {}
    for key in DATA_KEYS:
        data[key] = copy.deepcopy(serialized.get(key))
    reference_layer = data.get('reference_layer')
    if isinstance(reference_layer, dict):
        data['reference_layer'] = reference_layer.get('identifier')
    if data.get('extent') is not None:
        data['extent'] = list(data['extent'])
    if isinstance(data.get('filters'), str):
        try:
            data['filters'] = json.loads(data['filters'])
        except ValueError:
            pass
    config['data'] = data
    return config


# ---------------------------------------------------------------------------
# Update
# ---------------------------------------------------------------------------
def _is_admin(user) -> bool:
    """Return True when the user is an admin.

    :param user: The user.
    :type user: User
    :return: Whether the user is an admin.
    :rtype: bool
    """
    try:
        return bool(user.profile.is_admin)
    except AttributeError:
        return False


def _as_bool(value) -> bool:
    """Return a boolean from JSON or form values.

    :param value: The value ('true', 'false', bool, None).
    :type value: object
    :return: The boolean value.
    :rtype: bool
    """
    if isinstance(value, str):
        return value.lower() in ['true', '1', 'on', 'yes']
    return bool(value)


def _check_modified_at(dashboard: Dashboard, modified_at):  # noqa: DOC201
    """Reject the update when the dashboard changed since it was read.

    :param dashboard: The dashboard.
    :type dashboard: Dashboard
    :param modified_at: ``modified_at`` from the config the client read.
    :type modified_at: str
    :raises DashboardPayloadError: When the value is not a date time.
    :raises DashboardConflictError: When the dashboard changed since.
    """
    if not modified_at:
        return
    parsed = parse_datetime(str(modified_at))
    if parsed is None:
        raise DashboardPayloadError([{
            'field': 'modified_at',
            'message': _('Must be the modified_at value from the config.')
        }])
    if parsed != dashboard.modified_at:
        raise DashboardConflictError(
            _('The dashboard was changed after %(modified_at)s. '
              'Read the config again and reapply your change.') % {
                'modified_at': modified_at
            }
        )


def _pop_permission(dashboard: Dashboard, payload: dict, data: dict, user):
    """Take the optional ``permission`` block out of the payload.

    :param dashboard: The dashboard.
    :type dashboard: Dashboard
    :param payload: Top-level payload, changed in place.
    :type payload: dict
    :param data: The ``data`` object, changed in place.
    :type data: dict
    :param user: The user.
    :type user: User
    :return: The permission block, or None when it was not sent.
    :rtype: dict or None
    :raises DashboardSharePermissionError: Sent without share permission.
    :raises DashboardPayloadError: When the block is not valid JSON.
    """
    from geosight.permission.access import share_permission_resource
    from geosight.permission.access.mixin import ResourcePermissionDenied

    permission = data.pop('permission', None)
    top_level = payload.pop('permission', None)
    if permission is None:
        permission = top_level
    if permission is None:
        return None
    try:
        share_permission_resource(dashboard, user)
    except ResourcePermissionDenied:
        raise DashboardSharePermissionError(
            _('You need share permission to change who can access '
              'this dashboard.')
        )
    if isinstance(permission, str):
        try:
            permission = json.loads(permission)
        except ValueError:
            raise DashboardPayloadError([{
                'field': 'data.permission',
                'message': _('Must be valid JSON.')
            }])
    return permission


def update_dashboard_from_payload(  # noqa: DOC503
        dashboard: Dashboard, payload: dict, user: User, files
) -> Dashboard:
    """Update a dashboard in place.

    The dashboard row stays (same id, creator and created_at); only
    modified_at, modified_by and the version change. Keys that the payload
    does not send keep their current value: top-level settings and every key
    of ``data``. A list that is sent replaces the current list: items with a
    known id are updated, other items are created, and items left out are
    removed.

    ``permission`` is optional. When it is sent, the user needs share
    permission on the dashboard. Edit permission is checked by the caller.

    :param dashboard: Dashboard to update.
    :type dashboard: Dashboard
    :param payload: Incoming payload.
    :type payload: dict
    :param user: The user updating the dashboard.
    :type user: User
    :param files: Uploaded files dictionary.
    :type files: MultiValueDict or dict
    :return: The updated dashboard.
    :rtype: Dashboard
    :raises DashboardPayloadError: Invalid payload or failed save.
    :raises DashboardSharePermissionError: Permission sent without share.
    :raises DashboardConflictError: Stale ``modified_at``.
    """
    payload = dict(payload)
    if payload.get('data') in [None, '']:
        payload['data'] = {}
    incoming = normalize_payload(payload)
    incoming_data = incoming.pop('data')

    _check_modified_at(dashboard, incoming.pop('modified_at', None))
    permission = _pop_permission(dashboard, incoming, incoming_data, user)

    # Featured is admin only; sending the current value back is fine.
    if 'featured' in incoming and not _is_admin(user):
        if _as_bool(incoming['featured']) != bool(dashboard.featured):
            raise DashboardPayloadError([{
                'field': 'featured',
                'message': _('Only admins can change the Featured status.')
            }])
        incoming.pop('featured')

    # Start from the current config and overlay what was sent.
    merged = dashboard_config(dashboard)
    merged.pop('modified_at', None)
    merged_data = merged.pop('data')
    merged.update(incoming)
    merged_data.update(incoming_data)
    if permission is not None:
        merged_data['permission'] = permission
    if not _is_admin(user):
        merged.pop('featured', None)
    merged['data'] = merged_data

    validate_data(merged_data)
    data = _prepare_form_data(merged, user)
    if data['slug'] != dashboard.slug and Dashboard.name_is_exist_of_all(
            data['slug']
    ):
        raise _slug_taken_error(data['slug'])
    if 'featured' not in data:
        data['featured'] = dashboard.featured
    for key in KEEP_ON_UPDATE:
        if key not in data:
            data[key] = getattr(dashboard, key, None)

    data['creator'] = dashboard.creator
    data['modified_by'] = user
    form = DashboardForm(data, files, instance=dashboard)
    if not form.is_valid():
        raise DashboardPayloadError([
            {'field': key, 'message': ' '.join(value)}
            for key, value in form.errors.items()
        ])
    try:
        with transaction.atomic():
            dashboard = form.save()
            dashboard.save_relations(data, user=user)
            dashboard.increase_version()
    except Exception:
        logger.exception('Dashboard update failed.')
        raise DashboardPayloadError(
            [{'field': '', 'message': _(INTERNAL_UPDATE_ERROR)}]
        )
    return dashboard
