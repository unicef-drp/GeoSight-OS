"""GeoRepo Authentication failed View."""
import json

from core.serializer.user import UserSerializer
from frontend.views._base import BaseView


class GeoRepoAuthFailedPageView(BaseView):
    """GeoRepo Authentication Failed View."""

    template_name = 'frontend/georepo_auth_failed.html'

    @property
    def page_title(self):
        """Return page title that used on tab bar."""
        return 'GeoRepo'

    @property
    def content_title(self):
        """Return content title that used on page title indicator."""
        return 'GeoRepo Authorization Failed!'

    def get_context_data(self, **kwargs) -> dict:
        """Get context data."""
        context = super().get_context_data(**kwargs)
        next = self.request.GET.get('next', '')
        context.update({
            'content_title': self.content_title,
            'page_title': self.page_title,
            'user': {},
            'redirect_next_uri': next
        })
        if self.request.user.is_authenticated:
            context['user'] = json.dumps(
                UserSerializer(self.request.user).data
            )
        return context
