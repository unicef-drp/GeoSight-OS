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

import copy
import json

from django.contrib.auth import get_user_model
from django.urls import reverse

from core.tests.model_factories import GroupF
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class BaseViewTest(object):
    """Base test view."""

    class TestCase(BasePermissionTest.TestCase):
        """Test for Base Admin."""

        @property
        def list_url_tag(self):
            """Url list tag."""
            raise NotImplemented

        @property
        def create_url_tag(self):
            """Url create tag."""
            raise NotImplemented

        @property
        def edit_url_tag(self):
            """Url edit tag."""
            raise NotImplemented

        @property
        def payload(self):
            """Payload."""
            raise NotImplemented

        def test_list_view(self):
            """Test for list view."""
            url = reverse(self.list_url_tag)
            self.assertRequestGetView(url, 302)  # Non login
            self.assertRequestGetView(url, 403, self.viewer)  # Viewer
            self.assertRequestGetView(
                url, 200,
                self.contributor
            )  # Contributor
            self.assertRequestGetView(url, 200, self.creator)  # Creator
            self.assertRequestGetView(url, 200, self.admin)  # Admin

        def test_create_view(self):
            """Test for create view."""
            url = reverse(self.create_url_tag)
            self.assertRequestGetView(url, 302)  # Non login
            self.assertRequestGetView(url, 403, self.viewer)  # Viewer
            self.assertRequestGetView(
                url, 403, self.contributor
            )  # Contributor
            self.assertRequestGetView(url, 200, self.creator)  # Creator
            self.assertRequestGetView(url, 200, self.admin)  # Admin

            # POST it
            new_payload = copy.deepcopy(self.payload)
            new_payload['name'] = 'name 1'
            new_payload['shortcode'] = 'CODE 2'
            self.assertRequestPostView(url, 302, new_payload)
            self.assertRequestPostView(url, 403, new_payload, self.viewer)
            self.assertRequestPostView(url, 403, new_payload, self.contributor)

            self.assertRequestPostView(url, 302, new_payload, self.creator)
            new_resource = self.get_resources(self.creator).last()
            self.assertEqual(new_resource.name, new_payload['name'])
            self.assertEqual(new_resource.creator, self.creator)
            self.assertEqual(new_resource.modified_by, self.creator)

            # Check the edit permission
            url = reverse(self.edit_url_tag, kwargs={'pk': new_resource.id})
            self.assertRequestGetView(url, 302)  # Non login
            self.assertRequestGetView(url, 403, self.viewer)  # Viewer
            self.assertRequestGetView(
                url, 403, self.contributor
            )  # Contributor
            self.assertRequestGetView(url, 200, self.creator)  # Creator
            self.assertRequestGetView(
                url, 403, self.resource_creator
            )  # Creator
            self.assertRequestGetView(url, 200, self.admin)  # Admin

        def test_edit_view(self):
            """Test for edit view."""
            url = reverse(self.edit_url_tag, kwargs={'pk': 999})
            self.assertRequestGetView(url, 302)  # Resource not found

            url = reverse(self.edit_url_tag, kwargs={'pk': self.resource.id})
            self.assertRequestGetView(url, 302)  # Non login
            self.assertRequestGetView(url, 403, self.viewer)  # Viewer
            self.assertRequestGetView(
                url, 403, self.contributor
            )  # Contributor
            self.assertRequestGetView(url, 403, self.creator)  # Creator
            self.assertRequestGetView(
                url, 200, self.resource_creator
            )  # Creator
            self.assertRequestGetView(url, 200, self.admin)  # Admin

            # sharing
            self.assertRequestGetView(url, 403, self.viewer_in_group)
            self.assertRequestGetView(url, 403, self.contributor_in_group)
            self.assertRequestGetView(url, 403, self.creator_in_group)

            # sharing
            self.permission.update_user_permission(
                self.creator, PERMISSIONS.READ.name
            )
            self.assertRequestGetView(url, 403, self.creator)  # Creator
            self.permission.update_user_permission(
                self.creator, PERMISSIONS.WRITE.name
            )
            self.assertRequestGetView(url, 200, self.creator)  # Creator

            self.permission.update_group_permission(
                self.group, PERMISSIONS.READ.name
            )
            self.assertRequestGetView(url, 403, self.viewer_in_group)
            self.assertRequestGetView(url, 403, self.contributor_in_group)
            self.assertRequestGetView(url, 403, self.creator_in_group)

            self.permission.update_group_permission(
                self.group, PERMISSIONS.WRITE.name
            )
            self.assertRequestGetView(url, 403, self.viewer_in_group)
            self.assertRequestGetView(url, 200, self.contributor_in_group)
            self.assertRequestGetView(url, 200, self.creator_in_group)

            # POST it
            new_payload = copy.deepcopy(self.payload)
            new_payload['name'] = 'name 1'
            self.assertRequestPostView(url, 302, new_payload)
            self.assertRequestPostView(url, 403, new_payload, self.viewer)
            self.assertRequestPostView(url, 403, new_payload, self.contributor)

            self.assertRequestPostView(url, 302, new_payload, self.creator)
            self.resource.refresh_from_db()
            self.assertEqual(self.resource.name, new_payload['name'])
            self.assertEqual(self.resource.creator, self.resource_creator)
            self.assertEqual(self.resource.modified_by, self.creator)

    class TestCaseWithBatch(TestCase):
        """Test for batch Edit Admin."""

        @property
        def batch_edit_url_tag(self):
            """Url batch edit tag."""
            raise NotImplemented

        def test_batch_edit_view(self):
            """Test for edit view."""
            group_1 = GroupF()
            group_2 = GroupF()
            resources = [
                self.create_resource(self.resource_creator),
                self.create_resource(self.resource_creator),
                self.create_resource(self.resource_creator)
            ]
            # Save access permission
            for idx, permission in enumerate(
                    [
                        PERMISSIONS.NONE.name, PERMISSIONS.READ.name,
                        PERMISSIONS.READ.name
                    ]
            ):
                resources[idx].permission.public_permission = permission
                resources[idx].permission.save()

            # User permission
            resources[0].permission.update_user_permission(
                self.contributor, PERMISSIONS.WRITE.name
            )
            resources[0].permission.update_user_permission(
                self.creator, PERMISSIONS.WRITE.name
            )
            resources[1].permission.update_user_permission(
                self.contributor, PERMISSIONS.OWNER.name
            )
            resources[2].permission.update_user_permission(
                self.contributor, PERMISSIONS.READ.name
            )

            # Group permission
            resources[0].permission.update_group_permission(
                group_1, PERMISSIONS.SHARE.name
            )
            resources[0].permission.update_group_permission(
                group_2, PERMISSIONS.LIST.name
            )
            resources[1].permission.update_group_permission(
                group_1, PERMISSIONS.OWNER.name
            )
            resources[2].permission.update_group_permission(
                group_1, PERMISSIONS.WRITE.name
            )

            # Check batch access by role
            url = reverse(self.batch_edit_url_tag)
            self.assertRequestPostView(url, 302, data={})  # Non login
            self.assertRequestPostView(
                url, 403, data={}, user=self.viewer
            )  # Viewer
            self.assertRequestPostView(
                url, 400, data={}, user=self.contributor
            )  # Contributor
            self.assertRequestPostView(
                url, 400, data={}, user=self.creator
            )  # Creator
            self.assertRequestPostView(
                url, 400, data={}, user=self.admin
            )  # Admin

            # Update description by the non accessible
            ids = ",".join([f"{resource.id}" for resource in resources])
            url = reverse(self.batch_edit_url_tag)
            self.assertRequestPostView(
                url, 302, user=self.creator,
                data={
                    "ids": ids,
                    "description": "new description",
                }
            )

            # check resources and permission
            for idx, resource in enumerate(resources):
                resource.refresh_from_db()
                if idx == 0:
                    self.assertEquals(
                        resource.description, "new description"
                    )
                else:
                    self.assertNotEquals(
                        resource.description, "new description"
                    )
            for idx, permission in enumerate(
                    [
                        PERMISSIONS.NONE.name, PERMISSIONS.READ.name,
                        PERMISSIONS.READ.name
                    ]
            ):
                resources[idx].permission.refresh_from_db()
                self.assertEquals(
                    resources[idx].permission.public_permission,
                    permission
                )

            # Update description
            ids = ",".join([f"{resource.id}" for resource in resources])
            url = reverse(self.batch_edit_url_tag)
            self.assertRequestPostView(
                url, 302, user=self.resource_creator,
                data={
                    "ids": ids,
                    "description": "new description",
                }
            )

            # check resources and permission
            for resource in resources:
                resource.refresh_from_db()
                self.assertEquals(resource.description, "new description")
            for idx, permission in enumerate(
                    [
                        PERMISSIONS.NONE.name, PERMISSIONS.READ.name,
                        PERMISSIONS.READ.name
                    ]
            ):
                resources[idx].permission.refresh_from_db()
                self.assertEquals(
                    resources[idx].permission.public_permission,
                    permission
                )

            # Update access permission
            ids = ",".join([f"{resource.id}" for resource in resources])
            url = reverse(self.batch_edit_url_tag)
            self.assertRequestPostView(
                url, 302, user=self.resource_creator,
                data={
                    "ids": ids,
                    "description": "new description",
                    "permission": json.dumps(
                        {
                            "public_permission": PERMISSIONS.READ.name
                        }
                    )
                }
            )
            for idx, permission in enumerate(
                    [
                        PERMISSIONS.READ.name, PERMISSIONS.READ.name,
                        PERMISSIONS.READ.name
                    ]
            ):
                resources[idx].permission.refresh_from_db()
                self.assertEquals(
                    resources[idx].permission.public_permission,
                    permission
                )

            # Check user permission
            self.assertEquals(
                resources[0].permission.user_permissions.get(
                    user_id=self.contributor
                ).permission,
                PERMISSIONS.WRITE.name
            )
            self.assertEquals(
                resources[0].permission.user_permissions.get(
                    user_id=self.creator
                ).permission,
                PERMISSIONS.WRITE.name
            )
            self.assertEquals(
                resources[1].permission.user_permissions.count(), 1
            )
            self.assertEquals(
                resources[1].permission.user_permissions.get(
                    user_id=self.contributor
                ).permission,
                PERMISSIONS.OWNER.name
            )
            self.assertEquals(
                resources[2].permission.user_permissions.count(), 1
            )
            self.assertEquals(
                resources[2].permission.user_permissions.get(
                    user_id=self.contributor
                ).permission,
                PERMISSIONS.READ.name
            )

            # Check group permission
            self.assertEquals(
                resources[0].permission.group_permissions.get(
                    group_id=group_1
                ).permission,
                PERMISSIONS.SHARE.name
            )
            self.assertEquals(
                resources[0].permission.group_permissions.get(
                    group_id=group_2
                ).permission,
                PERMISSIONS.LIST.name
            )
            self.assertEquals(
                resources[1].permission.group_permissions.count(), 1
            )
            self.assertEquals(
                resources[1].permission.group_permissions.get(
                    group_id=group_1
                ).permission,
                PERMISSIONS.OWNER.name
            )
            self.assertEquals(
                resources[2].permission.group_permissions.count(), 1
            )
            self.assertEquals(
                resources[2].permission.group_permissions.get(
                    group_id=group_1
                ).permission,
                PERMISSIONS.WRITE.name
            )

            # Update access permission
            ids = ",".join([f"{resource.id}" for resource in resources])
            url = reverse(self.batch_edit_url_tag)
            self.assertRequestPostView(
                url, 302, user=self.resource_creator,
                data={
                    "ids": ids,
                    "description": "new description",
                    "permission": json.dumps(
                        {
                            "user_permissions_deleted": [
                                self.contributor.id
                            ],
                            "group_permissions_deleted": [
                                group_1.id
                            ]
                        }
                    )
                }
            )

            # Check user permission
            self.assertEquals(
                resources[0].permission.user_permissions.count(), 1
            )
            self.assertEquals(
                resources[0].permission.user_permissions.get(
                    user_id=self.creator
                ).permission,
                PERMISSIONS.WRITE.name
            )
            self.assertEquals(
                resources[1].permission.user_permissions.count(), 0
            )
            self.assertEquals(
                resources[2].permission.user_permissions.count(), 0
            )

            # Check group permission
            self.assertEquals(
                resources[0].permission.group_permissions.count(), 1
            )
            self.assertEquals(
                resources[0].permission.group_permissions.get(
                    group_id=group_2
                ).permission,
                PERMISSIONS.LIST.name
            )
            self.assertEquals(
                resources[1].permission.group_permissions.count(), 0
            )
            self.assertEquals(
                resources[2].permission.group_permissions.count(), 0
            )

            # Update access permission
            ids = ",".join([f"{resource.id}" for resource in resources])
            url = reverse(self.batch_edit_url_tag)
            self.assertRequestPostView(
                url, 302, user=self.resource_creator,
                data={
                    "ids": ids,
                    "description": "new description",
                    "permission": json.dumps(
                        {
                            "user_permissions": [{
                                'id': self.contributor.id,
                                'permission': PERMISSIONS.OWNER.name
                            }],
                            "group_permissions": [{
                                'id': group_1.id,
                                'permission': PERMISSIONS.WRITE.name
                            }]
                        }
                    )
                }
            )

            # Check user permission
            self.assertEquals(
                resources[0].permission.user_permissions.get(
                    user_id=self.contributor
                ).permission,
                PERMISSIONS.OWNER.name
            )
            self.assertEquals(
                resources[0].permission.user_permissions.get(
                    user_id=self.creator
                ).permission,
                PERMISSIONS.WRITE.name
            )
            self.assertEquals(
                resources[1].permission.user_permissions.count(), 1
            )
            self.assertEquals(
                resources[1].permission.user_permissions.get(
                    user_id=self.contributor
                ).permission,
                PERMISSIONS.OWNER.name
            )
            self.assertEquals(
                resources[2].permission.user_permissions.count(), 1
            )
            self.assertEquals(
                resources[2].permission.user_permissions.get(
                    user_id=self.contributor
                ).permission,
                PERMISSIONS.OWNER.name
            )

            # Check group permission
            self.assertEquals(
                resources[0].permission.group_permissions.get(
                    group_id=group_1
                ).permission,
                PERMISSIONS.WRITE.name
            )
            self.assertEquals(
                resources[0].permission.group_permissions.get(
                    group_id=group_2
                ).permission,
                PERMISSIONS.LIST.name
            )
            self.assertEquals(
                resources[1].permission.group_permissions.count(), 1
            )
            self.assertEquals(
                resources[1].permission.group_permissions.get(
                    group_id=group_1
                ).permission,
                PERMISSIONS.WRITE.name
            )
            self.assertEquals(
                resources[2].permission.group_permissions.count(), 1
            )
            self.assertEquals(
                resources[2].permission.group_permissions.get(
                    group_id=group_1
                ).permission,
                PERMISSIONS.WRITE.name
            )
