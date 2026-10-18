"""Django app configuration for H3 grid support"""
from django.apps import AppConfig


class H3GridConfig(AppConfig):
    """App config for H3 grid support"""

    name = 'geosight.h3grid'
    label = 'geosight_h3grid'
    verbose_name = 'H3 Grid'