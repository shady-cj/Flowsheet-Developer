from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework import serializers, status
from .serializers import ShapeSerializer, ScreenerSerializer, CrusherSerializer, GrinderSerializer, ConcentratorSerializer, MiscellaneousSerializer, ProjectSerializer, ProjectObjectSerializer
from .models import Shape, Screener, Crusher,Grinder, Concentrator, Miscellaneous, Project, ProjectObject
from authentication.models import User
from .utils import get_queryset_util, perform_create_update_util
from .mixins import ObjectPermissionMixin,UpdateCreatorMixin
from .permissions import ProjectObjectPermission
from rest_framework.exceptions import PermissionDenied









class ListCreateShapes(ListCreateAPIView):
    serializer_class = ShapeSerializer
    queryset = Shape.objects.all()


class ListCreateScreener(UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = ScreenerSerializer
    queryset = Screener.objects.all()

    def get_queryset(self):
        return get_queryset_util(self, Screener)
    
class RetrieveUpdateDestroyScreener(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = ScreenerSerializer
    lookup_field = "id"
    queryset = Screener.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Screener)


class ListCreateCrusher(UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = CrusherSerializer
    queryset = Crusher.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Crusher)

class RetrieveUpdateDestroyCrusher(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = CrusherSerializer
    lookup_field = "id"
    queryset = Crusher.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Crusher)



class ListCreateGrinder(UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = GrinderSerializer
    queryset = Grinder.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Grinder)

class RetrieveUpdateDestroyGrinder(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = GrinderSerializer
    lookup_field = "id"
    queryset = Grinder.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Grinder)


class ListCreateConcentrator(UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = ConcentratorSerializer
    queryset = Concentrator.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Concentrator)

class RetrieveUpdateDestroyConcentrator(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = ConcentratorSerializer
    lookup_field = "id"
    queryset = Concentrator.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Concentrator)



class ListCreateMiscellaneous(UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = MiscellaneousSerializer
    queryset = Miscellaneous.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Miscellaneous)

class RetrieveUpdateDestroyMiscellaneous(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = MiscellaneousSerializer
    lookup_field = "id"
    queryset = Miscellaneous.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Miscellaneous)
    

class ListCreateProject(UpdateCreatorMixin,ListCreateAPIView):
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Project.objects.all()
        return Project.objects.filter(creator=user)
 

class RetrieveUpdateDestroyProject(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    lookup_field = "id"
    queryset = Project.objects.all()
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Project.objects.all()
        return Project.objects.filter(creator=user)
    


from rest_framework import permissions
# It should be able to handle list of objects
class ListCreateProjectObject(ListCreateAPIView):
    # permission_classes = (ProjectObjectPermission, )
    permission_classes = (permissions.AllowAny, )
    serializer_class = ProjectObjectSerializer
    queryset = ProjectObject.objects.all()
    def get_queryset(self):
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        return ProjectObject.objects.filter(project__id=project_id)
    

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
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        
    def perform_create(self, serializer):
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        project_instance = Project.objects.get(id=project_id)

        data = self.request.data
        if isinstance(serializer.validated_data, list):
            length_of_data = len(data) if len(data) == len(serializer.validated_data) else None
            if length_of_data is None:
                raise serializers.ValidationError({"detail": "Error with validating json data"})
            for index in range(length_of_data):
                object_instance = perform_create_update_util(self, index, data)
                serializer.validated_data[index]['project'] = project_instance
                serializer.validated_data[index]['object'] = object_instance
            return serializer.save()
        object_instance = perform_create_update_util(self, None, data)
        return serializer.save(project=project_instance, object=object_instance)

class RetrieveUpdateDestroyProjectObject(RetrieveUpdateDestroyAPIView):
    permission_classes = (ProjectObjectPermission, )
    serializer_class = ProjectObjectSerializer
    lookup_field = "id"
    queryset = ProjectObject.objects.all()
    def get_queryset(self):
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        return ProjectObject.objects.filter(project__id=project_id)


    def perform_update(self, serializer):
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        object_info = eval(self.request.data.get("object_info"))
        print(object_info)
        object_name = object_info.get("object_model_name") # object_model expected values ("Shape", "Crusher", "Screener", "Grinder", "Concentrator", "Miscellaneous")
        object_model_id = object_info.get("object_id")
        if object_name not in EXPECTED_OBJECT_NAMES:
            raise serializers.ValidationError({"object_model_name": "Invalid object project name provided"})
        object_model = eval(object_name)
        object_instance = object_model.objects.get(id=int(object_model_id))
        project_instance = Project.objects.get(id=project_id)
        if not object_instance:
            raise serializers.ValidationError({"object_id": "Given id is not associated to any object in the database"})
        
        # quick check if the current user has access to the object
        user = self.request.user
        if object_instance.creator:
            if object_instance.creator == user or object_instance.creator.is_superuser:
                pass
            else:
                raise PermissionDenied("You are not authorized to use this object")
        
        return serializer.save(project=project_instance, object=object_instance)


