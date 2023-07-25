from rest_framework import serializers

from core.models.access_request import UserAccessRequest


class AccessRequestSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    submitted_date = serializers.DateTimeField(source='submitted_on')

    def get_name(self, obj: UserAccessRequest):
        if obj.requester_first_name and obj.requester_last_name:
            return f'{obj.requester_first_name} {obj.requester_last_name}'
        elif obj.requester_first_name:
            return obj.requester_first_name
        return '-'

    class Meta:
        model = UserAccessRequest
        fields = [
            'id',
            'name',
            'requester_email',
            'type',
            'status',
            'submitted_date'
        ]


class AccessRequestDetailSerializer(serializers.ModelSerializer):
    approval_by = serializers.SerializerMethodField()

    def get_approval_by(self, obj: UserAccessRequest):
        if obj.approved_by:
            return obj.approved_by.username
        return None

    class Meta:
        model = UserAccessRequest
        fields = [
            'id',
            'type',
            'status',
            'uuid',
            'submitted_on',
            'requester_first_name',
            'requester_last_name',
            'requester_email',
            'description',
            'request_by_id',
            'approved_date',
            'approved_by_id',
            'approver_notes',
            'approval_by'
        ]
