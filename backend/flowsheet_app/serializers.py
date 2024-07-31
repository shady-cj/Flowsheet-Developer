from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
# from rest_framework.exceptions import PermissionDenied

from .models import Shape, Screener, Crusher, Grinder, Concentrator, Auxilliary, Project, ProjectObject

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
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Screener
        fields = [
            "id", 
            "name",
            "image", 
            "image_url",
            "creator"
        ]
        read_only_fields = ["id", "image_url"]

    def get_image_url(self, instance): 
        return instance.image.url



class CrusherSerializer(ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Crusher
        fields = [
            "id",
            "name",
            "image", 
            "image_url",
            # "type",
            # "gape",
            # "set",
            "creator"
        ]
        read_only_fields = ["id", "image_url"]
    
    def get_image_url(self, instance): 
        return instance.image.url


class GrinderSerializer(ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Grinder
        fields = [
            "id",
            "name",
            "image",
            "image_url", 
            # "gape",
            # "set",
            "creator"
        ]
        read_only_fields = ["id","image_url"]

    def get_image_url(self, instance): 
        return instance.image.url

class ConcentratorSerializer(ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Concentrator
        fields = [
            "id", 
            "name",
            "image",
            "image_url",
            "description",
            # "recovery_rate",
            # "dilution_gain",
            "creator",
        ]
        read_only_fields = ["id", "image_url"]

    def get_image_url(self, instance): 
        return instance.image.url


class AuxilliarySerializer(ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = Auxilliary
        fields = [
            "id",
            "name",
            "image",
            "image_url", 
            "description",
            "type",
            "creator"
        ]
        read_only_fields = ["id", "image_url"]
    def get_image_url(self, instance): 
        return instance.image.url

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


class ProjectObjectSerializer(ModelSerializer):
    object = serializers.SerializerMethodField()
    class Meta:
        model = ProjectObject

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
            # "project",
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

        