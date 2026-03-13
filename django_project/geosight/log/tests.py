# coding=utf-8
"""
GeoSight is UNICEF's geospatial web-based business intelligence platform.

Contact : geosight-no-reply@unicef.org

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation; either version 3 of the License, or
    (at your option) any later version.

"""
__author__ = 'danang@kartoza.com'
__date__ = '13/11/2024'
__copyright__ = ('Copyright 2023, Unicef')

import os
import tempfile
import unittest
from unittest.mock import patch, MagicMock

from geosight.log.tasks import (
    delete_numbered_log_files,
    cleanup_tmp_directory
)


class TestDeleteNumberedLogFiles(unittest.TestCase):
    """Unit tests for delete_numbered_log_files function."""

    def setUp(self):
        """
        Set up temporary directory structure with test files.

        Creates a structure like:
        temp_dir/
        ├── worker.log
        ├── worker.log.1
        ├── worker.log.2
        ├── app.txt
        ├── app.txt.1
        ├── debug.status.5
        ├── backup.log.old
        ├── data.csv
        └── subdir/
            ├── nested.log.1
            └── nested.log.2
        """
        self.temp_dir = tempfile.mkdtemp()
        self.test_files = {
            # Numbered log files (should be deleted)
            'worker.log.1': 100,
            'worker.log.2': 200,
            'app.txt.1': 150,
            'debug.status.5': 50,

            # Non-numbered files (should NOT be deleted)
            'worker.log': 300,
            'app.txt': 250,
            'backup.log.old': 100,
            'data.csv': 500,
            'readme.log.2024': 75,
        }

        # Create test files
        for filename, size in self.test_files.items():
            filepath = os.path.join(self.temp_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(b'0' * size)

        # Create subdirectory with nested files
        self.subdir = os.path.join(self.temp_dir, 'subdir')
        os.makedirs(self.subdir)

        self.nested_files = {
            'nested.log.1': 120,
            'nested.log.2': 180,
            'nested.log': 400,
        }

        for filename, size in self.nested_files.items():
            filepath = os.path.join(self.subdir, filename)
            with open(filepath, 'wb') as f:
                f.write(b'0' * size)

    def tearDown(self):
        """Clean up temporary directory."""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_dry_run_does_not_delete_files(self):
        """Test that dry_run=True doesn't actually delete files."""
        count, size, files = delete_numbered_log_files(
            self.temp_dir, max_depth=0, dry_run=True
        )

        # Should identify 4 numbered files in root
        self.assertEqual(count, 4)
        self.assertEqual(size, 500)  # 100 + 200 + 150 + 50

        # Verify files still exist
        for filename in [
            'worker.log.1', 'worker.log.2', 'app.txt.1', 'debug.status.5'
        ]:
            filepath = os.path.join(self.temp_dir, filename)
            self.assertTrue(os.path.exists(filepath))

    def test_actual_deletion(self):
        """Test that dry_run=False actually deletes numbered files."""
        count, size, files = delete_numbered_log_files(
            self.temp_dir, max_depth=0, dry_run=False
        )

        # Should delete 4 numbered files
        self.assertEqual(count, 4)
        self.assertEqual(size, 500)

        # Verify numbered files are deleted
        for filename in [
            'worker.log.1', 'worker.log.2', 'app.txt.1', 'debug.status.5'
        ]:
            filepath = os.path.join(self.temp_dir, filename)
            self.assertFalse(os.path.exists(filepath))

        # Verify non-numbered files still exist
        for filename in [
            'worker.log', 'app.txt', 'backup.log.old', 'data.csv'
        ]:
            filepath = os.path.join(self.temp_dir, filename)
            self.assertTrue(os.path.exists(filepath))

    def test_recursive_deletion(self):
        """Test that max_depth allows recursive deletion in subdirectories."""
        count, size, files = delete_numbered_log_files(
            self.temp_dir, max_depth=1, dry_run=False
        )

        # Should delete 4 in root + 2 in subdir = 6 total
        self.assertEqual(count, 6)
        self.assertEqual(size, 800)  # 500 + 120 + 180

        # Verify nested numbered files are deleted
        self.assertFalse(
            os.path.exists(os.path.join(self.subdir, 'nested.log.1'))
        )
        self.assertFalse(
            os.path.exists(os.path.join(self.subdir, 'nested.log.2'))
        )

        # Verify nested non-numbered file still exists
        self.assertTrue(
            os.path.exists(os.path.join(self.subdir, 'nested.log'))
        )

    def test_max_depth_zero_ignores_subdirectories(self):
        """Test that max_depth=0 only processes root directory."""
        count, size, files = delete_numbered_log_files(
            self.temp_dir, max_depth=0, dry_run=False
        )

        # Should only delete files in root directory
        self.assertEqual(count, 4)

        # Verify subdirectory files are untouched
        self.assertTrue(
            os.path.exists(os.path.join(self.subdir, 'nested.log.1'))
        )
        self.assertTrue(
            os.path.exists(os.path.join(self.subdir, 'nested.log.2'))
        )

    def test_pattern_matching(self):
        """Test that only correctly numbered files are identified."""
        count, size, files = delete_numbered_log_files(
            self.temp_dir, max_depth=0, dry_run=True
        )

        # Extract filenames from full paths
        deleted_filenames = [os.path.basename(f) for f in files]

        # Should match these
        self.assertIn('worker.log.1', deleted_filenames)
        self.assertIn('worker.log.2', deleted_filenames)
        self.assertIn('app.txt.1', deleted_filenames)
        self.assertIn('debug.status.5', deleted_filenames)

        # Should NOT match these
        self.assertNotIn('worker.log', deleted_filenames)
        self.assertNotIn('backup.log.old', deleted_filenames)
        self.assertNotIn('readme.log.2024', deleted_filenames)
        self.assertNotIn('data.csv', deleted_filenames)

    def test_empty_directory(self):
        """Test behavior with empty directory."""
        empty_dir = os.path.join(self.temp_dir, 'empty')
        os.makedirs(empty_dir)

        count, size, files = delete_numbered_log_files(
            empty_dir, max_depth=1, dry_run=False
        )

        self.assertEqual(count, 0)
        self.assertEqual(size, 0)
        self.assertEqual(len(files), 0)

    def test_nonexistent_directory(self):
        """Test behavior with non-existent directory."""
        fake_dir = os.path.join(self.temp_dir, 'does_not_exist')

        count, size, files = delete_numbered_log_files(
            fake_dir, max_depth=1, dry_run=False
        )

        # Should handle gracefully
        self.assertEqual(count, 0)
        self.assertEqual(size, 0)

    def test_returned_file_list(self):
        """Test that returned file list contains correct paths."""
        count, size, files = delete_numbered_log_files(
            self.temp_dir, max_depth=1, dry_run=True
        )

        # Should return 6 files (4 root + 2 subdir)
        self.assertEqual(len(files), 6)

        # All returned paths should be absolute
        for filepath in files:
            self.assertTrue(os.path.isabs(filepath))

    def test_file_size_calculation(self):
        """Test that total size is correctly calculated."""
        count, size, files = delete_numbered_log_files(
            self.temp_dir, max_depth=0, dry_run=True
        )

        # Expected: 100 + 200 + 150 + 50 = 500 bytes
        self.assertEqual(size, 500)


class TestCleanupTmpDirectory(unittest.TestCase):
    """Unit tests for cleanup_tmp_directory task."""

    def _make_disk_usage(self, used_pct):
        """Return a mock disk_usage result for a given used percentage.

        :param used_pct: Percentage of disk used (0-100)
        :type used_pct: int or float
        :return: Mock object with total and used attributes
        :rtype: MagicMock
        """
        total = 100 * 1024 * 1024  # 100 MB
        used = int(total * used_pct / 100)
        usage = MagicMock()
        usage.total = total
        usage.used = used
        return usage

    @patch('geosight.log.tasks.delete_numbered_log_files')
    @patch('geosight.log.tasks.shutil.disk_usage')
    def test_no_cleanup_below_threshold(self, mock_disk_usage, mock_delete):
        """Function is NOT called when usage is below threshold.

        :param mock_disk_usage: Mock for shutil.disk_usage
        :type mock_disk_usage: MagicMock
        :param mock_delete: Mock for delete_numbered_log_files
        :type mock_delete: MagicMock
        """
        mock_disk_usage.return_value = self._make_disk_usage(80)

        result = cleanup_tmp_directory()

        mock_delete.assert_not_called()
        self.assertEqual(result, {'deleted_count': 0, 'freed_size_bytes': 0})

    @patch('geosight.log.tasks.delete_numbered_log_files')
    @patch('geosight.log.tasks.shutil.disk_usage')
    def test_cleanup_above_threshold(self, mock_disk_usage, mock_delete):
        """Function IS called with args when usage exceeds threshold.

        :param mock_disk_usage: Mock for shutil.disk_usage
        :type mock_disk_usage: MagicMock
        :param mock_delete: Mock for delete_numbered_log_files
        :type mock_delete: MagicMock
        """
        mock_disk_usage.return_value = self._make_disk_usage(95)
        mock_delete.return_value = (10, 1024 * 1024, ['/tmp/worker.log.1'])

        result = cleanup_tmp_directory()

        mock_delete.assert_called_once_with('/tmp', max_depth=2, dry_run=False)
        self.assertEqual(
            result, {'deleted_count': 10, 'freed_size_bytes': 1024 * 1024}
        )

    @patch('geosight.log.tasks.delete_numbered_log_files')
    @patch('geosight.log.tasks.shutil.disk_usage')
    def test_cleanup_at_exactly_threshold_not_triggered(
        self, mock_disk_usage, mock_delete
    ):
        """Cleanup is not triggered when usage equals the threshold.

        :param mock_disk_usage: Mock for shutil.disk_usage
        :type mock_disk_usage: MagicMock
        :param mock_delete: Mock for delete_numbered_log_files
        :type mock_delete: MagicMock
        """
        mock_disk_usage.return_value = self._make_disk_usage(90)

        result = cleanup_tmp_directory()

        mock_delete.assert_not_called()
        self.assertEqual(result, {'deleted_count': 0, 'freed_size_bytes': 0})

    @patch('geosight.log.tasks.delete_numbered_log_files')
    @patch('geosight.log.tasks.shutil.disk_usage')
    def test_threshold_override(self, mock_disk_usage, mock_delete):
        """threshold_override takes precedence over the settings value.

        :param mock_disk_usage: Mock for shutil.disk_usage
        :type mock_disk_usage: MagicMock
        :param mock_delete: Mock for delete_numbered_log_files
        :type mock_delete: MagicMock
        """
        mock_disk_usage.return_value = self._make_disk_usage(50)
        mock_delete.return_value = (3, 512, [])

        # Without override, 50% usage would not trigger cleanup (threshold=90)
        # With override of 40, it should trigger
        result = cleanup_tmp_directory(threshold_override=40)

        mock_delete.assert_called_once_with('/tmp', max_depth=2, dry_run=False)
        self.assertEqual(result, {'deleted_count': 3, 'freed_size_bytes': 512})

    @patch('geosight.log.tasks.delete_numbered_log_files')
    @patch('geosight.log.tasks.os.path.exists')
    def test_nonexistent_path_skipped(self, mock_exists, mock_delete):
        """Paths that do not exist are skipped without calling delete.

        :param mock_exists: Mock for os.path.exists
        :type mock_exists: MagicMock
        :param mock_delete: Mock for delete_numbered_log_files
        :type mock_delete: MagicMock
        """
        mock_exists.return_value = False

        result = cleanup_tmp_directory()

        mock_delete.assert_not_called()
        self.assertEqual(result, {'deleted_count': 0, 'freed_size_bytes': 0})
