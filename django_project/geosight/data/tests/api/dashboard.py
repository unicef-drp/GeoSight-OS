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

import base64
import json

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from core.models.preferences import SitePreferences
from geosight.data.models.dashboard import (
    Dashboard, DashboardBookmark, DashboardStory
)
from geosight.permission.models.factory import PERMISSIONS
from geosight.permission.models.manager import PermissionException
from geosight.permission.tests._base import BasePermissionTest

User = get_user_model()


class DashboardListApiTest(BasePermissionTest.TestCase):
    """Test for context list api."""

    def create_resource(self, user, name='name'):
        """Create resource function."""
        return Dashboard.permissions.create(
            user=user,
            name=name
        )

    def create_story_resource(self, user, name):
        """Create a dashboard that can be duplicated (has structures)."""
        return Dashboard.permissions.create(
            user=user,
            name=name,
            indicator_layers_structure={"children": []},
            context_layers_structure={"children": []},
            basemaps_layers_structure={"children": []},
            widgets_structure={"children": []},
        )

    def get_resources(self, user):
        """Create resource function."""
        return Dashboard.permissions.list(user).order_by('id')

    def test_list_api(self):
        """Test list API."""
        url = reverse('dashboard-list-api')
        self.permission.organization_permission = PERMISSIONS.NONE.name
        self.permission.public_permission = PERMISSIONS.NONE.name
        self.permission.save()

        # Check the list returned
        response = self.assertRequestGetView(url, 200)  # Non login
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.contributor)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.creator)  # Creator
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()), 0)

        response = self.assertRequestGetView(
            url, 200, self.resource_creator)  # Creator
        self.assertEqual(len(response.json()), 1)

        response = self.assertRequestGetView(url, 200, self.admin)  # Admin
        self.assertEqual(len(response.json()), 1)

        # sharing
        self.permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)
        response = self.assertRequestGetView(
            url, 200, self.contributor)  # Contributor
        self.assertEqual(len(response.json()), 1)

        self.permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.viewer_in_group)
        response = self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestGetView(url, 200, self.creator_in_group)
        response = self.assertRequestGetView(url, 200, self.creator_in_group)
        self.assertEqual(len(response.json()), 1)

        self.permission.public_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200, self.viewer)  # Viewer
        self.assertEqual(len(response.json()), 1)

        self.permission.organization_permission = PERMISSIONS.LIST.name
        self.permission.save()

        response = self.assertRequestGetView(url, 200)  # Viewer
        self.assertEqual(len(response.json()), 1)

    def test_featured_api(self):
        """Test list API."""
        with self.assertRaises(PermissionException):
            Dashboard.permissions.create(
                user=self.contributor,
                name='Dashboard test 1'
            )
        dashboard_1 = Dashboard.permissions.create(
            user=self.creator,
            name='Featured 1',
            indicator_layers_structure={"children": []},
            context_layers_structure={"children": []},
            basemaps_layers_structure={"children": []},
            widgets_structure={"children": []},
        )
        self.assertEqual(dashboard_1.featured, False)
        with self.assertRaises(PermissionError):
            Dashboard.permissions.create(
                user=self.creator,
                name='Featured 2',
                featured=True
            )
        dashboard_2 = Dashboard.permissions.create(
            user=self.admin,
            name='Featured 2',
            featured=True,
            indicator_layers_structure={"children": []},
            context_layers_structure={"children": []},
            basemaps_layers_structure={"children": []},
            widgets_structure={"children": []},
        )
        self.assertEqual(dashboard_2.featured, True)

        # Duplicate
        url = reverse(
            'dashboard-duplicate-api', kwargs={'slug': dashboard_1.slug}
        )
        self.assertRequestPostView(
            url, 302, data={}, user=self.creator
        )  # Creator
        dashboard = Dashboard.objects.get(slug=dashboard_1.slug + '-1')
        self.assertEqual(dashboard.featured, False)

        # Duplicate
        url = reverse(
            'dashboard-duplicate-api', kwargs={'slug': dashboard_2.slug}
        )
        self.assertRequestPostView(
            url, 302, data={}, user=self.admin
        )  # Creator
        dashboard = Dashboard.objects.get(slug=dashboard_2.slug + '-1')
        self.assertEqual(dashboard.featured, False)

    def test_data_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'Dashboard test')
        url = reverse('dashboard-data-api', kwargs={'slug': resource.slug})
        permission = resource.permission
        permission.organization_permission = PERMISSIONS.NONE.name
        permission.public_permission = PERMISSIONS.NONE.name
        permission.save()

        # Check the list returned
        self.assertRequestGetView(url, 403)  # Non login
        self.assertRequestGetView(url, 403, self.viewer)  # Viewer
        self.assertRequestGetView(url, 403, self.contributor)
        self.assertRequestGetView(url, 200, self.creator)

        self.assertRequestGetView(url, 403, self.viewer_in_group)
        self.assertRequestGetView(url, 403, self.creator_in_group)

        self.assertRequestGetView(
            url, 403, self.resource_creator)  # Creator
        self.assertRequestGetView(url, 200, self.admin)  # Admin

        # sharing
        permission.update_user_permission(
            self.contributor, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.contributor)
        self.assertRequestGetView(url, 200, self.contributor)  # Contributor

        permission.update_group_permission(
            self.group, PERMISSIONS.READ.name)
        self.assertRequestGetView(url, 200, self.viewer_in_group)
        self.assertRequestGetView(url, 200, self.creator_in_group)

        permission.public_permission = PERMISSIONS.READ.name
        permission.save()

        self.assertRequestGetView(url, 200, self.viewer)  # Viewer

    def test_data_content_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'Dashboard test 1')
        url = reverse('dashboard-data-api', kwargs={'slug': resource.slug})

        # Test from site preferences default
        response = self.assertRequestGetView(url, 200, self.creator)
        data = response.json()
        self.assertEqual(data['name'], 'Dashboard test 1')
        self.assertEqual(data['slug'], resource.slug)
        self.assertEqual(data['stories'], [])
        self.assertEqual(data['stories_structure'], None)
        self.assertEqual(data['story_map_enabled'], False)
        self.assertEqual(data['story_map_presentation'], False)
        pref = SitePreferences.preferences()
        self.assertEqual(data['default_time_mode'], {
            'use_only_last_known_value': True,
            'fit_to_current_indicator_range':
                pref.fit_to_current_indicator_range,
            'show_last_known_value_in_range':
                pref.show_last_known_value_in_range,
            'default_interval': pref.default_interval,
        })
        self.assertEqual(data['min_zoom'], 0)
        self.assertEqual(data['max_zoom'], 24)

        # Test from updates site preferences
        pref.fit_to_current_indicator_range = True
        pref.show_last_known_value_in_range = False
        pref.default_interval = 'Yearly'
        pref.save()

        # Second resource
        resource = self.create_resource(self.creator, 'Dashboard test 2')
        url = reverse('dashboard-data-api', kwargs={'slug': resource.slug})
        response = self.assertRequestGetView(url, 200, self.creator)
        data = response.json()

        self.assertEqual(data['default_time_mode'], {
            'use_only_last_known_value': True,
            'fit_to_current_indicator_range':
                pref.fit_to_current_indicator_range,
            'show_last_known_value_in_range':
                pref.show_last_known_value_in_range,
            'default_interval': pref.default_interval,
        })

        # Test overriden data
        resource.default_time_mode = {
            'use_only_last_known_value': True,
            'fit_to_current_indicator_range': True,
            'show_last_known_value_in_range': True,
            'default_interval': 'Daily',
        }
        resource.increase_version()
        resource.save()
        response = self.assertRequestGetView(url, 200, self.creator)
        data = response.json()
        self.assertEqual(data['default_time_mode'], {
            'use_only_last_known_value': True,
            'fit_to_current_indicator_range': True,
            'show_last_known_value_in_range': True,
            'default_interval': 'Daily',
        })

    def test_story_map_data_and_duplicate_api(self):
        """Test story map data is serialized and preserved on duplicate."""
        resource = self.create_story_resource(
            self.creator, 'Dashboard with story'
        )
        bookmark = DashboardBookmark.objects.create(
            dashboard=resource,
            creator=self.creator,
            name='Story bookmark'
        )
        story = DashboardStory.objects.create(
            dashboard=resource,
            name='Story page 1',
            description='Narrative step',
            bookmark=bookmark,
            visible_by_default=True,
            order=1,
            config={'auto_play': False}
        )
        resource.story_map_enabled = True
        resource.story_map_presentation = True
        # Same format as the admin form: page ids in the children.
        resource.stories_structure = {'children': [story.id]}
        resource.save()

        url = reverse('dashboard-data-api', kwargs={'slug': resource.slug})
        response = self.assertRequestGetView(url, 200, self.creator)
        data = response.json()
        self.assertEqual(data['story_map_enabled'], True)
        self.assertEqual(data['story_map_presentation'], True)
        self.assertEqual(len(data['stories']), 1)
        self.assertEqual(data['stories'][0]['name'], 'Story page 1')
        self.assertEqual(data['stories'][0]['bookmark_id'], bookmark.id)
        self.assertEqual(data['stories'][0]['config'], {'auto_play': False})
        self.assertEqual(
            data['stories_structure'], {'children': [story.id]}
        )

        duplicate_url = reverse(
            'dashboard-duplicate-api', kwargs={'slug': resource.slug}
        )
        self.assertRequestPostView(
            duplicate_url, 302, data={}, user=self.creator
        )
        duplicated = Dashboard.objects.get(slug=resource.slug + '-1')
        duplicated_story = duplicated.dashboardstory_set.get(name='Story page 1')
        self.assertEqual(duplicated.story_map_enabled, True)
        self.assertEqual(duplicated.story_map_presentation, True)
        self.assertEqual(
            duplicated.stories_structure,
            {'children': [duplicated_story.id]}
        )
        self.assertEqual(duplicated_story.description, 'Narrative step')
        self.assertEqual(duplicated_story.config, {'auto_play': False})
        self.assertEqual(duplicated_story.bookmark.name, 'Story bookmark')

    def _story_dashboard(self):
        """Return a dashboard with one bookmark and one story page."""
        resource = self.create_story_resource(
            self.creator, 'Dashboard story 2'
        )
        bookmark = DashboardBookmark.objects.create(
            dashboard=resource, creator=self.creator, name='Bookmark A'
        )
        story = DashboardStory.objects.create(
            dashboard=resource, name='Page A', bookmark=bookmark,
            visible_by_default=True, order=0
        )
        resource.story_map_enabled = True
        resource.stories_structure = {'children': [story.id]}
        resource.save()
        return resource, bookmark, story

    def test_story_kept_when_bookmark_deleted(self):
        """Deleting a bookmark unlinks it from the story page."""
        resource, bookmark, story = self._story_dashboard()
        bookmark.delete()
        story.refresh_from_db()
        self.assertIsNone(story.bookmark)
        self.assertEqual(resource.dashboardstory_set.count(), 1)

    def test_save_relations_without_stories_keeps_them(self):
        """A payload without story data does not touch the stories."""
        resource, bookmark, story = self._story_dashboard()
        resource.save_relations(self._minimal_relations(), user=self.creator)
        resource.refresh_from_db()
        self.assertEqual(
            list(resource.dashboardstory_set.values_list('id', flat=True)),
            [story.id]
        )
        self.assertTrue(resource.story_map_enabled)
        self.assertEqual(resource.stories_structure, {'children': [story.id]})

    def _minimal_relations(self):
        """Return the relation data save_relations needs, without stories."""
        return {
            'indicators': [], 'indicator_layers': [],
            'indicator_layers_structure': {'children': []},
            'basemaps_layers': [], 'basemaps_layers_structure': {
                'children': []
            },
            'context_layers': [], 'context_layers_structure': {
                'children': []
            },
            'widgets': [], 'widgets_structure': {'children': []},
            'related_tables': [], 'tools': [],
        }

    def test_story_default_bookmark(self):
        """The "Default" bookmark (id 0) is kept, also on duplicate."""
        resource, bookmark, story = self._story_dashboard()
        resource.save_stories([
            {
                'id': story.id, 'name': 'Page A', 'bookmark_id': 0,
                'config': {'auto_play': False}
            },
            {'name': 'Page B', 'bookmark_id': bookmark.id},
        ])
        page_a = resource.dashboardstory_set.get(name='Page A')
        self.assertIsNone(page_a.bookmark)
        self.assertEqual(
            page_a.config, {'auto_play': False, 'default_bookmark': True}
        )

        url = reverse('dashboard-data-api', kwargs={'slug': resource.slug})
        data = self.assertRequestGetView(url, 200, self.creator).json()
        bookmarks = {row['name']: row['bookmark_id'] for row in data['stories']}
        self.assertEqual(bookmarks, {'Page A': 0, 'Page B': bookmark.id})

        # Choosing a saved bookmark again removes the flag.
        resource.save_stories([
            {'id': page_a.id, 'name': 'Page A', 'bookmark_id': bookmark.id},
        ])
        page_a.refresh_from_db()
        self.assertEqual(page_a.bookmark, bookmark)
        self.assertIsNone(page_a.config)

        # Duplicate keeps the "Default" choice.
        resource.save_stories([
            {'id': page_a.id, 'name': 'Page A', 'bookmark_id': 0},
        ])
        resource.stories_structure = {'children': [page_a.id]}
        resource.save()
        duplicate_url = reverse(
            'dashboard-duplicate-api', kwargs={'slug': resource.slug}
        )
        self.assertRequestPostView(
            duplicate_url, 302, data={}, user=self.creator
        )
        duplicated = Dashboard.objects.get(slug=resource.slug + '-1')
        duplicated_story = duplicated.dashboardstory_set.get(name='Page A')
        self.assertEqual(duplicated_story.bookmark_value, 0)

    def test_duplicate_copies_story_thumbnail(self):
        """Duplicating a dashboard keeps the story page thumbnails."""
        resource, bookmark, story = self._story_dashboard()
        png = base64.b64decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMA'
            'ASsJTYQAAAAASUVORK5CYII='
        )
        story.icon = SimpleUploadedFile(
            'story.png', png, content_type='image/png'
        )
        story.save()

        duplicate_url = reverse(
            'dashboard-duplicate-api', kwargs={'slug': resource.slug}
        )
        self.assertRequestPostView(
            duplicate_url, 302, data={}, user=self.creator
        )
        duplicated = Dashboard.objects.get(slug=resource.slug + '-1')
        duplicated_story = duplicated.dashboardstory_set.get(name='Page A')
        self.assertEqual(duplicated_story.icon.name, story.icon.name)
        self.assertNotEqual(duplicated_story.bookmark_id, bookmark.id)
        self.assertEqual(duplicated_story.bookmark.dashboard, duplicated)
        self.assertEqual(
            duplicated.stories_structure, {'children': [duplicated_story.id]}
        )

    def test_delete_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'name 2')
        url = reverse('dashboard-detail-api', kwargs={'slug': resource.slug})
        self.assertRequestDeleteView(url, 403)
        self.assertRequestDeleteView(url, 403, self.viewer)
        self.assertRequestDeleteView(url, 403, self.contributor)
        self.assertRequestDeleteView(url, 403, self.resource_creator)

        response = self.assertRequestGetView(
            reverse('dashboard-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 1)

        self.assertRequestDeleteView(url, 200, self.creator)
        response = self.assertRequestGetView(
            reverse('dashboard-list-api'), 200, self.creator)
        self.assertEqual(len(response.json()), 0)

    def test_delete_multiple_api(self):
        """Test list API."""
        resource = self.create_resource(self.creator, 'name 2')
        url = reverse('dashboard-list-api')
        self.assertRequestDeleteView(
            url, 200, self.viewer, data={'ids': json.dumps([resource.id])}
        )
        self.assertEqual(Dashboard.objects.count(), 2)
        self.assertRequestDeleteView(
            url, 200, self.creator, data={'ids': json.dumps([resource.slug])}
        )
        self.assertEqual(Dashboard.objects.count(), 1)
