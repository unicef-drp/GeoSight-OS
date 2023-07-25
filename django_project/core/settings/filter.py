"""Request Filter Exception."""
import re

from django.utils.regex_helper import _lazy_re_compile
from django.views.debug import SafeExceptionReporterFilter


class ExtendSafeExceptionReporterFilter(SafeExceptionReporterFilter):
    """Extend to include additional keywords."""

    hidden_settings = _lazy_re_compile(
        "API|TOKEN|KEY|SECRET|PASS|SIGNATURE|AZURE",
        flags=re.I
    )
