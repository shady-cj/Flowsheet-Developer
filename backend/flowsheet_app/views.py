from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, GenericAPIView
from rest_framework import serializers, status
from .serializers import ShapeSerializer, ScreenerSerializer, CrusherSerializer, GrinderSerializer, ConcentratorSerializer, AuxilliarySerializer, ProjectSerializer, ProjectObjectSerializer
from .models import Shape, Screener, Crusher,Grinder, Concentrator, Auxilliary, Project, ProjectObject
from authentication.models import User
from .utils import get_queryset_util, create_object_util, update_object_util
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



class ListCreateAuxilliary(UpdateCreatorMixin, ListCreateAPIView):
    serializer_class = AuxilliarySerializer
    queryset = Auxilliary.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Auxilliary)

class RetrieveUpdateDestroyAuxilliary(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = AuxilliarySerializer
    lookup_field = "id"
    queryset = Auxilliary.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Auxilliary)
    

class ListCreateProject(UpdateCreatorMixin,ListCreateAPIView):
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Project.objects.all()
        return Project.objects.filter(creator=user)
 
# from rest_framework import permissions

class RetrieveUpdateDestroyProject(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    # permission_classes = [permissions.AllowAny]
    serializer_class = ProjectSerializer
    lookup_field = "id"
    queryset = Project.objects.all()
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Project.objects.all()
        return Project.objects.filter(creator=user)
        # return Project.objects.all()
    
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
class ListCreateProjectObject(ListCreateAPIView):
    permission_classes = (ProjectObjectPermission, )
    # permission_classes = (permissions.AllowAny, )
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
                object_instance = create_object_util(self, index, data)
                serializer.validated_data[index]['project'] = project_instance
                serializer.validated_data[index]['object'] = object_instance  
   
            return serializer.save()
        object_instance = create_object_util(self, None, data)
        return serializer.save(project=project_instance, object=object_instance)
    


class UpdateDestroyProjectObject(GenericAPIView):
    permission_classes = (ProjectObjectPermission, )
    serializer_class = ProjectObjectSerializer
    queryset = ProjectObject.objects.all()
    

    def get_queryset(self):
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        return ProjectObject.objects.filter(project__id=project_id)

    
    def put(self, request, *args, **kwargs):
        data = request.data
        project_id = request.parser_context.get("kwargs").get("project_id")
        project_instance = Project.objects.get(id=project_id)
        serializers = []
        if isinstance(data, list):
            for entry in data:
                if "id" in entry:
                    entry_id = entry.get("id")
                    project_object_instance = ProjectObject.objects.get(id=entry_id)
                    serializer = self.get_serializer(project_object_instance, data=entry)
                    serializer.is_valid(raise_exception=True)
                else:
                    serializer = self.get_serializer(data=entry)
                    serializer.is_valid(raise_exception=True)
                serializers.append(serializer)

            self.custom_perform_update(serializers)
            queryset_serializer = self.get_serializer(project_instance.project_objects.all(), many=True)
            return Response(queryset_serializer.data)
        return Response({"detail": "Expecting a list"}, status=status.HTTP_400_BAD_REQUEST)
    

    def custom_perform_update(self, serializers):
        project_id = self.request.parser_context.get("kwargs").get("project_id")
        project_instance = Project.objects.get(id=project_id)
        data = self.request.data

        length_of_data = len(data) if len(data) == len(serializers) else None
        if length_of_data is None:
            raise serializers.ValidationError({"detail": "Error with validating json data"})
        
        # We need to know if an object has been deleted
        # Get existing existing project objects and compare the ids with the ones in the validated_data passed in

        data_oids = set([]) # using "set" data structure to reduce the compare operation to average time complexity of O(n)
        for entry in serializers:
            data_oids.add(entry.validated_data["oid"])
            
        existing_project_objects = project_instance.project_objects.all()
        for project_object in existing_project_objects:
            if project_object.oid not in data_oids:
                # Means it has been deleted in the frontend
                project_object.delete()
        for index in range(length_of_data):
            object_instance = update_object_util(self, index, data)
            serializers[index].save(project=project_instance, object=object_instance) # Adding object=object_instance here is not needed for those objects that just needs update but it's important for the objects that were being created, hence why it's being added here, it would be improved later to prevent unnecessary query to the database.
        return None





# class RetrieveUpdateDestroyProjectObject(RetrieveUpdateDestroyAPIView):
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


