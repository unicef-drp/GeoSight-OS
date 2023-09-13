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

import json

from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView

from geosight.data.models import Indicator
from geosight.georepo.models import ReferenceLayerView, ReferenceLayerIndicator
from geosight.permission.access import RoleSuperAdminRequiredMixin
from geosight.permission.models import (
    default_permission,
    ReferenceLayerIndicatorPermission as Permission,
    ReferenceLayerIndicatorUserPermission as UserPermission,
    ReferenceLayerIndicatorGroupPermission as GroupPermission
)

User = get_user_model()


class DatasetAccessAPI(RoleSuperAdminRequiredMixin, APIView):
    """API for list of group."""

    def get(self, request):
        """Return permission data of group.

        Returning all or resources and also the permission.
        On resources, it is list of [id, name].
        On permissions, it is {d,i,u,p}.
        d = dataset id
        i = indicator id
        u = user id
        p = permission
        """
        user_permissions = []
        for ref in Permission.objects.all():
            for permission in ref.user_permissions.all():
                user_permissions.append({
                    'd': ref.obj.reference_layer.id,
                    'di': ref.obj.reference_layer.identifier,
                    'dn': ref.obj.reference_layer.name,
                    'i': ref.obj.indicator.id,
                    'in': ref.obj.indicator.name,
                    'o': permission.user.id,
                    'on': permission.user.username,
                    'or': permission.user.profile.role,
                    'p': permission.permission
                })
        group_permissions = []
        for ref in Permission.objects.all():
            for permission in ref.group_permissions.all():
                group_permissions.append({
                    'd': ref.obj.reference_layer.id,
                    'di': ref.obj.reference_layer.identifier,
                    'dn': ref.obj.reference_layer.name,
                    'i': ref.obj.indicator.id,
                    'in': ref.obj.indicator.name,
                    'o': permission.group.id,
                    'on': permission.group.name,
                    'p': permission.permission
                })
        general_permissions_dict = {}
        for ref in Permission.objects.all():
            id = f'{ref.obj.reference_layer.id}-{ref.obj.indicator.id}'
            general_permissions_dict[id] = {
                'd': ref.obj.reference_layer.id,
                'di': ref.obj.reference_layer.identifier,
                'dn': ref.obj.reference_layer.name,
                'i': ref.obj.indicator.id,
                'in': ref.obj.indicator.name,
                'o': ref.organization_permission,
                'p': ref.public_permission
            }

        general_permissions = []
        for indicator in Indicator.objects.all():
            for reference_layer in ReferenceLayerView.objects.all():
                id = f'{reference_layer.id}-{indicator.id}'
                try:
                    general_permissions.append(general_permissions_dict[id])
                except KeyError:
                    ref = Permission(
                        obj=ReferenceLayerIndicator(
                            reference_layer=reference_layer,
                            indicator=indicator
                        )
                    )
                    general_permissions.append({
                        'd': ref.obj.reference_layer.id,
                        'di': ref.obj.reference_layer.identifier,
                        'dn': ref.obj.reference_layer.name,
                        'i': ref.obj.indicator.id,
                        'in': ref.obj.indicator.__str__(),
                        'o': ref.organization_permission,
                        'p': ref.public_permission
                    })

        # Get permission choices
        obj = Permission()
        org_perm_choices = obj.get_organization_permission_display.keywords[
            'field'].choices

        return Response(
            {
                'permissions': {
                    'users': user_permissions,
                    'groups': group_permissions,
                    'generals': general_permissions
                },
                'permission_choices': org_perm_choices
            }
        )

    def post(self, request):
        """Post permission of dataset."""
        data = json.loads(request.data['data'])

        for permission in data['generals']:
            reference_layer = ReferenceLayerView.get_by_identifier(
                permission['d'])
            if not reference_layer:
                continue

            permission['d'] = reference_layer.id
            ref, created = ReferenceLayerIndicator.objects.get_or_create(
                reference_layer_id=permission['d'],
                indicator_id=permission['i']
            )
            obj, created = Permission.objects.get_or_create(
                obj=ref)
            obj.organization_permission = permission.get(
                'o', default_permission.organization.default
            )
            obj.public_permission = permission['p']
            obj.save()

        # Save users
        for permission in data['users']:
            reference_layer = ReferenceLayerView.get_by_identifier(
                permission['d'])
            if not reference_layer:
                continue
            ref, created = ReferenceLayerIndicator.objects.get_or_create(
                reference_layer_id=reference_layer.id,
                indicator_id=permission['i']
            )
            obj, created = Permission.objects.get_or_create(
                obj=ref)
            perm, _ = UserPermission.objects.get_or_create(
                obj=obj,
                user_id=permission['o']
            )
            if 'is_del' in permission and permission['is_del']:
                perm.delete()
            else:
                perm.permission = permission['p']
                perm.save()

        # Save groups
        for permission in data['groups']:
            reference_layer = ReferenceLayerView.get_by_identifier(
                permission['d'])
            if not reference_layer:
                continue
            ref, created = ReferenceLayerIndicator.objects.get_or_create(
                reference_layer_id=reference_layer.id,
                indicator_id=permission['i']
            )
            obj, created = Permission.objects.get_or_create(
                obj=ref)
            perm, _ = GroupPermission.objects.get_or_create(
                obj=obj,
                group_id=permission['o']
            )
            if 'is_del' in permission and permission['is_del']:
                perm.delete()
            else:
                perm.permission = permission['p']
                perm.save()
        return Response('OK')
