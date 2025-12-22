"""Base dashboard View."""
from abc import ABC
from django.forms.models import model_to_dict
from django.http import HttpResponseBadRequest
from django.shortcuts import redirect

from azure_auth.backends import AzureAuthRequiredMixin
from frontend.views._base import BaseView
from geosight.permission.access import (
    RoleContributorRequiredMixin
)


class AdminBaseView(ABC, AzureAuthRequiredMixin, BaseView):
    """Admin base dashboard View."""

    pass


class AdminBatchEditView(RoleContributorRequiredMixin):
    """Admin batch edit view."""

    def get_context_data(self, **kwargs) -> dict:
        """Return context data."""
        context = super().get_context_data(**kwargs)
        context['batch'] = True
        return context

    @property
    def edit_query(self):
        """Return query for edit."""
        raise NotImplementedError()

    @property
    def form(self):
        """Return form."""
        raise NotImplementedError()

    @property
    def redirect_url(self):
        """Return redirect url."""
        raise NotImplementedError()

    def pre_update_data(self, data):
        """Pre update data."""
        pass

    def post_update_instance(self, instance, data, request):
        """Called when instance is saved."""
        # Save permission
        instance.permission.update_from_request_data(
            request.POST, request.user, clean_update=False
        )

    def post(self, request, **kwargs):
        """Edit basemap."""
        data = request.POST.copy()
        ids = data.get('ids', None)
        if not ids:
            return HttpResponseBadRequest('ids needs in payload')
        ids = ids.split(',')

        # Doing pre update data
        self.pre_update_data(data)

        for instance in self.edit_query.filter(id__in=ids):
            # Save style if it has style on payload
            initial_data = model_to_dict(instance)
            try:
                if instance.group:
                    initial_data['group'] = instance.group.name
            except AttributeError:
                pass

            # Put initial data from data
            for key, value in data.items():
                initial_data[key] = value

            form = self.form(initial_data, instance=instance)
            form.is_valid()
            instance = form.instance
            instance.save()

            self.post_update_instance(instance, data, request)
        return redirect(self.redirect_url)
