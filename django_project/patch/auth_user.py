"""Patch validation for auth model."""

from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db.models.signals import class_prepared
from django.utils.regex_helper import _lazy_re_compile
from django.utils.translation import gettext_lazy as _

username_helptext = _(
    'Required. 150 characters or fewer. '
    'Letters, digits and @/./+/-/_/# only.'
)


# patch user validator
def patch_username_signal(sender, *args, **kwargs):
    """Signal updating validator on username of auth.user."""
    if (sender.__name__ == "User" and
            sender.__module__ == "django.contrib.auth.models"):
        field = sender._meta.get_field("username")
        for v in field.validators:
            if isinstance(v, UnicodeUsernameValidator):
                v.regex = _lazy_re_compile(r'^[#\w.@+-]+\Z', 0)
                v.message = username_helptext
                v.flags = 0


class_prepared.connect(patch_username_signal)
