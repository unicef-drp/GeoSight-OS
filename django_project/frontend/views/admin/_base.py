"""Base dashboard View."""
from abc import ABC

from azure_auth.backends import AzureAuthRequiredMixin
from frontend.views._base import BaseView


class AdminBaseView(ABC, AzureAuthRequiredMixin, BaseView):
    """Admin base dashboard View."""

    pass
