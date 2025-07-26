from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    GenericAPIView,
    ListAPIView,
    RetrieveUpdateAPIView,
)
from rest_framework.views import APIView
from rest_framework import serializers, status

from .serializers import (
    ShapeSerializer,
    ScreenerSerializer,
    CrusherSerializer,
    GrinderSerializer,
    ConcentratorSerializer,
    AuxilliarySerializer,
    ProjectSerializer,
    FlowsheetObjectSerializer,
    ProjectDetailSerializer,
    FlowsheetSerializer,
)
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
from authentication.models import User
from .utils import (
    get_queryset_util,
    create_object_util,
    update_object_util,
    destroy_object_util,
    upload_preview_image,
)
from .mixins import ObjectPermissionMixin, UpdateCreatorMixin, handleCreationMixin
from .permissions import FlowsheetObjectPermission, FlowsheetInstancePermission
from rest_framework.exceptions import PermissionDenied


class ListCreateShapes(ListCreateAPIView):
    serializer_class = ShapeSerializer
    queryset = Shape.objects.all()


class ListCreateScreener(handleCreationMixin, UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = ScreenerSerializer
    queryset = Screener.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Screener)


class RetrieveUpdateScreener(ObjectPermissionMixin, RetrieveUpdateAPIView):
    serializer_class = ScreenerSerializer
    lookup_field = "id"
    queryset = Screener.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Screener)


class ListCreateCrusher(handleCreationMixin, UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = CrusherSerializer
    queryset = Crusher.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Crusher)


class RetrieveUpdateCrusher(ObjectPermissionMixin, RetrieveUpdateAPIView):
    serializer_class = CrusherSerializer
    lookup_field = "id"
    queryset = Crusher.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Crusher)


class ListCreateGrinder(handleCreationMixin, UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = GrinderSerializer
    queryset = Grinder.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Grinder)


class RetrieveUpdateGrinder(ObjectPermissionMixin, RetrieveUpdateAPIView):
    serializer_class = GrinderSerializer
    lookup_field = "id"
    queryset = Grinder.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Grinder)


class ListCreateConcentrator(
    handleCreationMixin, UpdateCreatorMixin, ListCreateAPIView
):
    serializer_class = ConcentratorSerializer
    queryset = Concentrator.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Concentrator)


class RetrieveUpdateConcentrator(ObjectPermissionMixin, RetrieveUpdateAPIView):
    serializer_class = ConcentratorSerializer
    lookup_field = "id"
    queryset = Concentrator.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Concentrator)


class ListCreateAuxilliary(handleCreationMixin, UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = AuxilliarySerializer
    queryset = Auxilliary.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Auxilliary)


class RetrieveUpdateAuxilliary(ObjectPermissionMixin, RetrieveUpdateAPIView):
    serializer_class = AuxilliarySerializer
    lookup_field = "id"
    queryset = Auxilliary.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Auxilliary)


class DashboardSearch(APIView):
    def get(self, request, format=None):
        query = request.GET.get("q")

        if not query or len(query) < 3:
            return Response([], status=status.HTTP_200_OK)

        # We'll improve search functionality later
        projects_match = Project.objects.filter(
            name__icontains=query, creator=request.user
        ).all()
        flowsheets_match = Flowsheet.objects.filter(
            name__icontains=query, project__creator=request.user
        ).all()
        return Response(
            {
                "projects": ProjectSerializer(projects_match, many=True).data,
                "flowsheets": FlowsheetSerializer(flowsheets_match, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class UpdateFlowsheetPreview(APIView):
    def put(self, request, format=None, flowsheet_id=None):
        data = request.data
        url = upload_preview_image(data.get("preview"), flowsheet_id)
        if not url:
            Response(
                "Couldn't process preview image", status=status.HTTP_400_BAD_REQUEST
            )
        flowsheet = Flowsheet.objects.get(id=flowsheet_id)
        flowsheet.preview_url = url
        flowsheet.save()
        flowsheet.project.save()
        return Response("OK", status=status.HTTP_200_OK)


class FlowsheetCreateView(APIView):
    def get(self, request, format=None, project_id=None):
        user = request.user
        user_flowsheets = Flowsheet.objects.filter(project__creator=user).order_by(
            "-last_edited"
        )

        project = get_object_or_404(Project, id=project_id)

        serialized_user_flowsheets = FlowsheetSerializer(
            user_flowsheets, many=True
        ).data

        return Response(
            {"project": project.name, "flowsheets": serialized_user_flowsheets},
            status=status.HTTP_200_OK,
        )


class ListFlowsheet(ListAPIView):
    serializer_class = FlowsheetSerializer
    queryset = Flowsheet.objects.all()

    def get_queryset(self):
        user = self.request.user
        query_params = self.request.GET.get("f")
        limit = self.request.GET.get("limit")
        offset = self.request.GET.get("offset")

        # print("query params ----", query_params)
        print("limit ", limit)
        print("offset ", offset)
        if query_params == "recents":
            if not limit:
                return Flowsheet.objects.filter(project__creator=user).order_by(
                    "-last_edited"
                )[
                    :20
                ]  # for now just fetch the first 20
            else:
                return Flowsheet.objects.filter(project__creator=user).order_by(
                    "-last_edited"
                )[int(offset) : int(offset) + int(limit)]
        elif query_params == "starred":
            if not limit:

                return Flowsheet.objects.filter(
                    project__creator=user, starred=True
                ).order_by("-last_edited")
            else:
                return Flowsheet.objects.filter(
                    project__creator=user, starred=True
                ).order_by("-last_edited")[int(offset) : int(offset) + int(limit)]
        if not limit:
            return Flowsheet.objects.filter(project__creator=user)
        else:
            return Flowsheet.objects.filter(project__creator=user).order_by(
                "-last_edited"
            )[int(offset) : int(offset) + int(limit)]


class ListCreateFlowsheet(ListCreateAPIView):
    serializer_class = FlowsheetSerializer
    permission_classes = (FlowsheetInstancePermission,)
    queryset = Flowsheet.objects.all()

    def get_queryset(self):
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        return Flowsheet.objects.filter(project__id=project_id)

    def perform_create(self, serializer):
        print("validated_data", serializer.validated_data)
        data = self.request.data
        footprint = data.get("footprint")
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        project_instance = Project.objects.get(id=project_id)
        project_instance.save()
        new_flowsheet_instance = serializer.save(project=project_instance)
        if footprint != "none":
            get_footprint = get_object_or_404(Flowsheet, id=footprint)
            flowsheet_objects = []
            for obj in get_footprint.flowsheet_objects.all():
                new_obj = FlowsheetObject(
                    content_type=obj.content_type,
                    object_id=obj.object_id,
                    label=obj.label,
                    object=obj.object,
                    x_coordinate=obj.x_coordinate,
                    y_coordinate=obj.y_coordinate,
                    scale=obj.scale,
                    font_size=obj.font_size,
                    description=obj.description,
                    properties=obj.properties,
                    flowsheet=new_flowsheet_instance,
                )
                flowsheet_objects.append(new_obj)
            FlowsheetObject.objects.bulk_create(flowsheet_objects)
            # update the preview url since they are the same.
            new_flowsheet_instance.preview_url = get_footprint.preview_url
            new_flowsheet_instance.save()
        # print("new flowsheet instance", new_flowsheet_instance)
        return new_flowsheet_instance


class RetrieveUpdateDestroyFlowsheet(RetrieveUpdateDestroyAPIView):
    serializer_class = FlowsheetSerializer
    lookup_field = "id"
    permission_classes = (FlowsheetInstancePermission,)
    lookup_url_kwarg = "flowsheet_id"
    queryset = Flowsheet.objects.all()

    def get_queryset(self):
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        return Flowsheet.objects.filter(project__id=project_id)


class ListCreateProject(UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()

    def get_queryset(self):
        query_params = self.request.GET.get("f")
        limit = self.request.GET.get("limit")
        offset = self.request.GET.get("offset")
        # print("query params ", query_params)
        user = self.request.user
        if query_params == "recents":
            if not limit:
                return Project.objects.filter(creator=user).order_by("-last_edited")[
                    :20
                ]
            else:
                return Project.objects.filter(creator=user).order_by("-last_edited")[
                    int(offset) : int(offset) + int(limit)
                ]

        elif query_params == "starred":
            if not limit:
                return Project.objects.filter(creator=user, starred=True).order_by(
                    "-last_edited"
                )
            else:
                return Project.objects.filter(creator=user, starred=True).order_by(
                    "-last_edited"
                )[int(offset) : int(offset) + int(limit)]
        # if user.is_superuser:
        #     return Project.objects.all() will consider this later...

        if not limit:
            return Project.objects.filter(creator=user)
        else:
            return Project.objects.filter(creator=user).order_by("-last_edited")[
                int(offset) : int(offset) + int(limit)
            ]


class RetrieveUpdateDestroyProject(ObjectPermissionMixin, RetrieveUpdateDestroyAPIView):
    # permission_classes = [permissions.AllowAny]
    serializer_class = ProjectSerializer
    lookup_field = "id"
    queryset = Project.objects.all()

    def get_queryset(self):
        print("request user", self.request.user, self.get_permissions())
        user = self.request.user
        if user.is_superuser:
            return Project.objects.all()
        return Project.objects.filter(creator=user)
        # return Project.objects.all()

    def retrieve(self, request, *args, **kwargs):
        # print("multiple lookup fields: ", self.multiple_lookup_fields)
        project_id = self.kwargs["id"]
        # project_id = self.request.parser_context.get("kwargs").get("id")
        project = Project.objects.get(id=project_id)
        serialized_project = ProjectDetailSerializer(project)
        return Response(serialized_project.data, status=status.HTTP_200_OK)

    # def update(self, request, *args, **kwargs):
    #     partial = kwargs.pop('partial', False)
    #     data = request.data
    #     project_objects = data.get("project_objects")
    #     print(project_objects)
    #     instance = self.get_object()
    #     if project_objects and isinstance(project_objects, list):
    #         for item in project_objects:
    #             print(item)
    #             project_object_id = item.get("id")
    #             project_object_instance = ProjectObject.objects.get(id=project_object_id, project=instance)
    #             project_object_serializer = ProjectObjectSerializer(instance=project_object_instance, data=item, partial=partial)
    #             project_object_serializer.is_valid(raise_exception=True)
    #             object_instance = create_object_util(self, None, item)
    #             project_object_serializer.save(project=instance, object=object_instance)

    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=data, partial=partial)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)
    #     return Response(serializer.data, status=status.HTTP_200_OK)


# It should be able to handle list of objects
class ListCreateFlowsheetObject(ListCreateAPIView):
    permission_classes = (FlowsheetObjectPermission,)
    # permission_classes = (permissions.AllowAny, )
    serializer_class = FlowsheetObjectSerializer
    queryset = FlowsheetObject.objects.all()

    def get_queryset(self):
        flowsheet_id = self.request.parser_context.get("kwargs").get("flowsheet_id")
        return FlowsheetObject.objects.filter(flowsheet__id=flowsheet_id)

    # Override the create() method in order to allow saving of multiple data

    def create(self, request, *args, **kwargs):
        data = request.data

        if isinstance(data, list):
            serializer = self.get_serializer(data=data, many=True)
        else:
            serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def perform_create(self, serializer):
        flowsheet_id = self.request.parser_context.get("kwargs").get("flowsheet_id")
        flowsheet_instance = Flowsheet.objects.get(id=flowsheet_id)

        data = self.request.data

        if isinstance(serializer.validated_data, list):
            length_of_data = (
                len(data) if len(data) == len(serializer.validated_data) else None
            )
            if length_of_data is None:
                raise serializers.ValidationError(
                    {"detail": "Error with validating json data"}
                )
            for index in range(length_of_data):
                object_instance = create_object_util(self, index, data)
                serializer.validated_data[index]["flowsheet"] = flowsheet_instance
                serializer.validated_data[index]["object"] = object_instance

            return serializer.save()
        object_instance = create_object_util(self, None, data)
        return serializer.save(flowsheet=flowsheet_instance, object=object_instance)


class UpdateFlowsheetObject(GenericAPIView):
    permission_classes = (FlowsheetObjectPermission,)
    serializer_class = FlowsheetObjectSerializer
    queryset = FlowsheetObject.objects.all()

    def get_queryset(self):
        flowsheet_id = self.request.parser_context.get("kwargs").get("flowsheet_id")
        return FlowsheetObject.objects.filter(flowsheet__id=flowsheet_id)

    def put(self, request, *args, **kwargs):
        data = request.data
        # print("data", data)
        flowsheet_id = request.parser_context.get("kwargs").get("flowsheet_id")
        flowsheet_instance = Flowsheet.objects.get(id=flowsheet_id)
        serializers = []

        if isinstance(data, list):
            for entry in data:
                if "id" in entry:
                    entry_id = entry.get("id")
                    flowsheet_object_instance = FlowsheetObject.objects.get(id=entry_id)
                    serializer = self.get_serializer(
                        flowsheet_object_instance, data=entry
                    )
                    serializer.is_valid(raise_exception=True)
                else:
                    serializer = self.get_serializer(data=entry)
                    serializer.is_valid(raise_exception=True)
                serializers.append(serializer)
            # print("serializers", serializers)

            self.perform_custom_update(
                serializers
            )  # updates or creates new flowsheet objects
            queryset_serializer = self.get_serializer(
                flowsheet_instance.flowsheet_objects.all(), many=True
            )
            return Response(queryset_serializer.data)
        return Response(
            {"detail": "Expecting a list"}, status=status.HTTP_400_BAD_REQUEST
        )

    def perform_custom_update(self, serializers):
        flowsheet_id = self.request.parser_context.get("kwargs").get("flowsheet_id")
        flowsheet_instance = Flowsheet.objects.get(id=flowsheet_id)
        data = self.request.data

        length_of_data = len(data) if len(data) == len(serializers) else None
        if length_of_data is None:
            raise serializers.ValidationError(
                {"detail": "Error with validating json data"}
            )

        # We need to know if an object has been deleted
        # Get existing existing project objects and compare the ids with the ones in the validated_data passed in

        data_oids = set(
            []
        )  # using "set" data structure to reduce the compare operation to average time complexity of O(n)
        for entry in serializers:
            data_oids.add(entry.validated_data["oid"])

        existing_flowsheet_objects = flowsheet_instance.flowsheet_objects.all()
        for flowsheet_object in existing_flowsheet_objects:
            if flowsheet_object.oid not in data_oids:
                # Means it has been deleted in the frontend
                flowsheet_object.delete()
        for index in range(length_of_data):
            object_instance = update_object_util(self, index, data)
            serializers[index].save(
                flowsheet=flowsheet_instance, object=object_instance
            )  # Adding object=object_instance here is not needed for those objects that just needs update but it's important for the objects that were being created, hence why it's being added here, it would be improved later to prevent unnecessary query to the database.
        return None


class DestroyFlowsheetObject(APIView):
    def delete(self, request, format=None, *args, **kwargs):
        object_id = request.data.get("objectId")
        object_type = request.data.get("objectType")
        f_objs = FlowsheetObject.objects.filter(object_id=object_id)
        if f_objs.exists():
            return Response(
                {"message": "The object is in use by other flowsheets"},
                status=status.HTTP_200_OK,
            )
        feedback = destroy_object_util(object_id, object_type, request.user)
        print(feedback)
        return Response(status=status.HTTP_204_NO_CONTENT)


# class RetrieveUpdateDestroyFlowsheetObject(RetrieveUpdateDestroyAPIView):
#     permission_classes = (ProjectObjectPermission, )
#     # permission_classes = (permissions.AllowAny, )
#     serializer_class = ProjectObjectSerializer
#     lookup_field = "id"
#     queryset = ProjectObject.objects.all()
#     def get_queryset(self):
#         project_id = self.request.parser_context.get("kwargs").get("project_id")
#         return ProjectObject.objects.filter(project__id=project_id)


#     def update(self, request, *args, **kwargs):
#         partial = kwargs.pop('partial', False)
#         instance = self.get_object()
#         data = request.data
#         if isinstance(data, list):
#             serializer = self.get_serializer(instance, data=data, many=True, partial=partial)
#         else:
#             serializer = self.get_serializer(instance, data=data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)

#         if getattr(instance, '_prefetched_objects_cache', None):
#             # If 'prefetch_related' has been applied to a queryset, we need to
#             # forcibly invalidate the prefetch cache on the instance.
#             instance._prefetched_objects_cache = {}

#         return Response(serializer.data)


#     def perform_update(self, serializer):
#         project_id = self.request.parser_context.get("kwargs").get("project_id")
#         project_instance = Project.objects.get(id=project_id)
#         data = self.request.data

#         if isinstance(serializer.validated_data, list):
#             # We need to know if an object has been deleted
#             length_of_data = len(data) if len(data) == len(serializer.validated_data) else None

#             if length_of_data is None:
#                 raise serializers.ValidationError({"detail": "Error with validating json data"})

#             # Get existing existing project objects and compare the ids with the ones in the validated_data passed in

#             data_oids = set([]) # using "set" data structure to reduce the compare operation to average time complexity of O(n)
#             for entry in serializer.validated_data:
#                 data_oids.add(entry["oid"])

#             existing_project_objects = project_instance.project_objects.all()
#             for project_object in existing_project_objects:
#                 if str(project_object.oid) not in data_oids:
#                     # Means it has been deleted in the frontend
#                     project_object.delete()

#             for index in range(length_of_data):
#                 object_instance = update_object_util(self, index, data)
#                 serializer.validated_data[index]['project'] = project_instance
#                 serializer.validated_data[index]['object'] = object_instance

#             return serializer.save()
#         object_instance = update_object_util(self, None, data)
#         return serializer.save(project=project_instance, object=object_instance)
