from rest_framework import serializers
from .models import Users, Dashboards


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        exclude = ['password',]
        read_only_fields = ['id']


class DashboardsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dashboards
        exclude = ['fav_by',]
        read_only_fields = ['id']
