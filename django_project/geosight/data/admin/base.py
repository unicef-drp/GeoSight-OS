
class BaseAdminMixin:
    """Mixins for base admin."""

    def save_model(self, request, obj, form, change):
        instance = form.save(commit=False)
        instance.modified_by = request.user
        instance.save()
        form.save_m2m()
        return instance