from rest_framework.serializers import ModelSerializer, SerializerMethodField
from rest_framework import serializers

# from rest_framework.exceptions import PermissionDenied
from .models import DEFAULT_PREVIEW_URL

from .models import (
    Shape,
    Screener,
    Crusher,
    Grinder,
    Concentrator,
    Auxilliary,
    Project,
    FlowsheetObject,
    Flowsheet,
)


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
        fields = ["id", "name", "image_url", "image_height", "image_width", "creator"]
        read_only_fields = ["id"]


class CrusherSerializer(ModelSerializer):

    class Meta:
        model = Crusher
        fields = ["id", "name", "image_url", "image_height", "image_width", "creator"]
        read_only_fields = ["id"]


class GrinderSerializer(ModelSerializer):
    class Meta:
        model = Grinder
        fields = ["id", "name", "image_url", "image_height", "image_width", "creator"]
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
            "creator",
        ]
        read_only_fields = ["id"]


# class ProjectInlineSerializer(serializers.Serializer):
#     id = serializers.IntegerField(read_only=True)
#     name = serializers.CharField()
#     description = serializers.CharField()


class ProjectSerializer(ModelSerializer):
    preview_url = SerializerMethodField(read_only=True)
    background_preview_url = SerializerMethodField(read_only=True)
    link = SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "get_mins_ago",
            "name",
            "preview_url",
            "background_preview_url",
            "starred",
            "creator",
            "last_edited",
            "description",
            "link",
        ]
        read_only_fields = [
            "id",
            "link",
            "creator",
            "get_mins_ago",
            "preview_url",
            "background_preview_url",
        ]

    def get_preview_url(self, instance):
        preview_url = None
        flowsheets = instance.flowsheets
        if flowsheets.exists():
            latest_flowsheet = instance.flowsheets.order_by("-last_edited")[0]
            preview_url = latest_flowsheet.preview_url
        # if not preview_url:
        #     # Remember to change this...
        #     preview_url = "https://res.cloudinary.com/dpykexpss/image/upload/v1737482485/grid_je7dz4.png"

        return preview_url

    def get_background_preview_url(self, instance):
        return DEFAULT_PREVIEW_URL

    def get_link(self, instance):
        return f"project/{instance.id}"


class ProjectDetailSerializer(ModelSerializer):
    project = SerializerMethodField(read_only=True)
    flowsheets = SerializerMethodField(read_only=True)

    class Meta:
        model = Project
        fields = ["project", "flowsheets"]

    def get_project(self, instance):
        return ProjectSerializer(instance).data

    def get_flowsheets(self, instance):
        flowsheets = instance.flowsheets.order_by("-last_edited")
        return FlowsheetSerializer(flowsheets, many=True).data


class FlowsheetSerializer(ModelSerializer):
    link = SerializerMethodField(read_only=True)
    project_name = SerializerMethodField(read_only=True)

    class Meta:
        model = Flowsheet
        fields = [
            "id",
            "name",
            "description",
            "preview_url",
            "background_preview_url",
            "get_mins_ago",
            "project",  # project id
            "project_name",  # project name
            "starred",
            "link",
            "last_edited",
            "save_frequency",
            "save_frequency_type",
        ]
        read_only_fields = [
            "id",
            "link",
            "creator",
            "get_mins_ago",
            "project",
            "background_preview_url",
        ]

    def get_link(self, instance):
        return f"project/{instance.project.id}/flowsheet/{instance.id}"

    def get_project_name(self, instance):
        return instance.project.name

    def validate(self, attrs):
        """
        Ensure that the save settings are valid
        """
        save_frequency_type = attrs.get("save_frequency_type")
        save_frequency = attrs.get("save_frequency")
        if save_frequency_type and save_frequency_type == "AUTO":
            if not save_frequency:
                raise serializers.ValidationError(
                    "Save frequency must be set for auto save frequency type"
                )
            if save_frequency < 10:
                raise serializers.ValidationError(
                    "Save frequency must be greater than 10 seconds"
                )
        return super().validate(attrs)


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
            "properties",
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
