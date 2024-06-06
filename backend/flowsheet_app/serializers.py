from rest_framework.serializers import ModelSerializer
from rest_framework import serializers

from .models import Shape, Screener, Crusher, Grinder, Concentrator, Miscellaneous, Project, ProjectObject

# Shapes Serializers

class ShapeSerializer(ModelSerializer):
    class Meta:
        model = Shape
        fields = [
            "id",
            "name",
            "image"
        ]
        read_only_fields = ["id"]


class ScreenerSerializer(ModelSerializer):
    class Meta:
        model = Screener
        fields = [
            "id", 
            "name",
            "image", 
            "creator"
        ]
        read_only_fields = ["id"]


class CrusherSerializer(ModelSerializer):
    class Meta:
        model = Crusher
        fields = [
            "id",
            "name",
            "image", 
            "type",
            "gape",
            "set",
            "creator"
        ]
        read_only_fields = ["id"]


class GrinderSerializer(ModelSerializer):
    class Meta:
        model = Grinder
        fields = [
            "id",
            "name",
            "image",
            "gape",
            "set",
            "creator"
        ]
        read_only_fields = ["id"]


class ConcentratorSerializer(ModelSerializer):
    class Meta:
        model = Concentrator
        fields = [
            "id", 
            "name",
            "image",
            "description",
            "recovery_rate",
            "dilution_gain",
            "creator",
        ]
        read_only_fields = ["id"]


class MiscellaneousSerializer(ModelSerializer):
    class Meta:
        model = Miscellaneous
        fields = [
            "id",
            "name",
            "image",
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
        read_only_fields = ["id"]


class ProjectObjectSerializer(ModelSerializer):
    class Meta:
        model = ProjectObject

        fields = [
            "id",
            "oid",
            "object",
            "x_coordinate",
            "y_coordinate",
            "scale",
            "font-size",
            "description",
            "project",
            "properties"
        ]

        