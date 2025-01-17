from django.test import TestCase
from django.db import models
from core.models.preferences import SitePreferences, SitePreferencesImage


class SitePreferenceTest(TestCase):
    model = SitePreferences

    def setUp(self):
        self.test_obj = SitePreferences.preferences()
        for field in self.test_obj._meta.get_fields():
            if isinstance(field, (models.FileField, models.ImageField)):
                setattr(
                    self.test_obj,
                    field.name,

                )

    def test_delete_do_file_cleanup(self):
        breakpoint()
        # self.site_preferences.delete()