from django.middleware.common import CommonMiddleware


class SelectiveAppendSlashMiddleware(CommonMiddleware):
    """Disable APPEND_SLASH redirect for specific paths."""

    EXCLUDED_PREFIXES = (
        "/cloud-native-gis/ogc/",
    )

    def should_redirect_with_slash(self, request):
        path = request.path_info

        # Skip redirect untuk prefix tertentu
        if path.startswith(self.EXCLUDED_PREFIXES):
            return False

        return super().should_redirect_with_slash(request)
