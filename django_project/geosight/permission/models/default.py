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

from geosight.permission.models.factory import PERMISSIONS

ALL_PERMISSIONS = [
    (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
    (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
    (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
    (PERMISSIONS.SHARE.name, PERMISSIONS.SHARE.name),
    (PERMISSIONS.OWNER.name, PERMISSIONS.OWNER.name),
]
ALL_PERMISSIONS_WITH_DATA = [
    (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
    (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
    (PERMISSIONS.READ_DATA.name, PERMISSIONS.READ_DATA.name),
    (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
    (PERMISSIONS.WRITE_DATA.name, PERMISSIONS.WRITE_DATA.name),
    (PERMISSIONS.SHARE.name, PERMISSIONS.SHARE.name),
    (PERMISSIONS.OWNER.name, PERMISSIONS.OWNER.name),
]


class PermissionDefaultDetail:
    """Class that has permission detail data."""

    def __init__(self, default: str, permissions: list):
        """Initiate permission default detail."""
        self.default = default
        self.permissions = permissions


class PermissionResourceDefault:
    """Permission default for resource."""

    def __init__(
            self,
            user: PermissionDefaultDetail,
            group: PermissionDefaultDetail,
            organization: PermissionDefaultDetail,
            public: PermissionDefaultDetail
    ):
        """Initiate permission default detail."""
        self.user = user
        self.group = group
        self.organization = organization
        self.public = public


class PermissionDefault:
    """Permission defaults for all resource."""

    # Dashboard
    DASHBOARD = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )
    # Indicator
    INDICATOR = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )

    # Context layer
    CONTEXT_LAYER = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )

    # Basemap
    BASEMAP = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )

    # Harvester
    HARVESTER = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.READ.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.READ.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
            ]
        )
    )

    # Group
    GROUP = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.READ.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.READ.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
            ]
        )
    )

    # Dataset
    DATASET = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.WRITE.name, PERMISSIONS.WRITE.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )

    # Related table
    RELATED_TABLE = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS_WITH_DATA
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS_WITH_DATA
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.READ_DATA.name, PERMISSIONS.READ_DATA.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ_DATA.name, PERMISSIONS.READ_DATA.name),
            ]
        )
    )

    # Style
    STYLE = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=ALL_PERMISSIONS
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.LIST.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.NONE.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
            ]
        )
    )

    # Reference Layer View
    REFERENCE_LAYER_VIEW = PermissionResourceDefault(
        user=PermissionDefaultDetail(
            default=PERMISSIONS.READ_DATA.name,
            permissions=ALL_PERMISSIONS_WITH_DATA
        ),
        group=PermissionDefaultDetail(
            default=PERMISSIONS.READ_DATA.name,
            permissions=ALL_PERMISSIONS_WITH_DATA
        ),
        organization=PermissionDefaultDetail(
            default=PERMISSIONS.READ_DATA.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.LIST.name, PERMISSIONS.LIST.name),
                (PERMISSIONS.READ.name, PERMISSIONS.READ.name),
                (PERMISSIONS.READ_DATA.name, PERMISSIONS.READ_DATA.name),
            ]
        ),
        public=PermissionDefaultDetail(
            default=PERMISSIONS.READ_DATA.name,
            permissions=[
                (PERMISSIONS.NONE.name, PERMISSIONS.NONE.name),
                (PERMISSIONS.READ_DATA.name, PERMISSIONS.READ_DATA.name),
            ]
        )
    )
