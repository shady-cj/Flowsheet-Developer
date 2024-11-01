from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
# from rest_framework.exceptions import PermissionDenied

from .models import Shape, Screener, Crusher, Grinder, Concentrator, Auxilliary, Project, FlowsheetObject, Flowsheet

from .utils import object_formatter
# Shapes Serializers

class ShapeSerializer(ModelSerializer):
    class Meta:
        model = Shape
        fields = [
            "id",
            "name",
        ]
        read_only_fields = ["id"]


class ScreenerSerializer(ModelSerializer):
    class Meta:
        model = Screener
        fields = [
            "id", 
            "name",
            "image_url",
            "image_height",
            "image_width",
            "creator"
        ]
        read_only_fields = ["id"]



class CrusherSerializer(ModelSerializer):

    class Meta:
        model = Crusher
        fields = [
            "id",
            "name",
            "image_url",
            "image_height",
            "image_width",
            "creator"
        ]
        read_only_fields = ["id"]


class GrinderSerializer(ModelSerializer):
    class Meta:
        model = Grinder
        fields = [
            "id",
            "name",
            "image_url",
            "image_height",
            "image_width",
            "creator"
        ]
        read_only_fields = ["id"]


class ConcentratorSerializer(ModelSerializer):
    class Meta:
        model = Concentrator
        fields = [
            "id", 
            "name",
            "image_url",
            "image_height",
            "image_width",
            "description",
            "valuable_recoverable",
            "gangue_recoverable",
            "creator",
        ]


class AuxilliarySerializer(ModelSerializer):
    class Meta:
        model = Auxilliary
        fields = [
            "id",
            "name",
            "image_url", 
            "image_height",
            "image_width",
            "description",
            "type",
            "creator"
        ]
        read_only_fields = ["id"]

# class ProjectInlineSerializer(serializers.Serializer):
#     id = serializers.IntegerField(read_only=True)
#     name = serializers.CharField()
#     description = serializers.CharField()


class ProjectSerializer(ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "creator",
            "description"
        ]
        read_only_fields = ["id", "creator"]


class FlowsheetSerializer(ModelSerializer):
    class Meta:
        model = Flowsheet
        fields = [
            "id",
            "name",
            "description",
            "preview_url",
            "get_mins_ago",
            "project"
        ]
        read_only_fields = ["id", "creator", "get_mins_ago"]


class FlowsheetObjectSerializer(ModelSerializer):
    object = serializers.SerializerMethodField()
    class Meta:
        model = FlowsheetObject

        fields = [
            "id",
            "oid",
            "object",
            "label",
            "x_coordinate",
            "y_coordinate",
            "scale",
            "font_size",
            "description",
            "flowsheet",
            "properties"
        ]
        read_only_fields = ["id"]

    def get_object(self, instance):
        if instance.object:
            return object_formatter(instance.object)
        return instance.object



    # def validate(self, attrs):
    #     """
    #     Carry out user validation here
    #     """
    #     project = attrs.get("project")
    #     request = self.context.get('request')
    #     if project.creator.id == request.user.id or request.user.is_superuser:
    #         return super().validate(attrs)
    #     raise PermissionDenied("This user is not authorized to view or make changes")

        