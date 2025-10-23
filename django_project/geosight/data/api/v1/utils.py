from geosight.georepo.models import ReferenceLayerView


def update_request_reference_dataset(request, key):
    """Reference dataset."""
    request.GET = request.GET.copy()
    reference_dataset = request.GET.get('reference_dataset')
    if reference_dataset:
        # filter by dataset
        dataset = ReferenceLayerView.objects.get(
            identifier=reference_dataset
        )
        request.GET[key] = ','.join(
            dataset.countries.all().values_list(
                'geom_id', flat=True
            )
        )
