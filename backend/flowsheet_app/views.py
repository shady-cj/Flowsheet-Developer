from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .serializers import ShapeSerializer, ScreenerSerializer, CrusherSerializer, GrinderSerializer, ConcentratorSerializer, MiscellaneousSerializer, ProjectSerializer, ProjectObjectSerializer
from .models import Shape, Screener, Crusher,Grinder, Concentrator, Miscellaneous, Project, ProjectObject
from authentication.models import User
from django.db.models import Q
from .mixins import ObjectPermissionMixin,UpdateCreatorMixin




# =================================
# Defining a simple `get_queryset_util` function that would be used for filtering the get_queryset for each api view

def get_queryset_util(self, obj_class):
    user = self.request.user
    if user.is_superuser:
        return obj_class.objects.all()
    return obj_class.objects.filter(Q(creator = user) | Q(creator__is_superuser = True)).distinct()

# ==================================



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
        return get_queryset_util(self, Project)
 

class RetrieveUpdateDestroyProject(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    lookup_field = "id"
    queryset = Project.objects.all()
    def get_queryset(self):
        return get_queryset_util(self, Project)
    


# class ListCreateProjectObject(UpdateCreatorMixin,ListCreateAPIView):
#     serializer_class = ProjectObjectSerializer
#     queryset = ProjectObject.objects.all()
#     def get_queryset(self):
#         return get_queryset_util(self, ProjectObject)
 

# class RetrieveUpdateDestroyProjectObject(ObjectPermissionMixin,RetrieveUpdateDestroyAPIView):
#     serializer_class = ProjectObjectSerializer
#     lookup_field = "id"
#     queryset = ProjectObject.objects.all()
#     def get_queryset(self):
#         return get_queryset_util(self, ProjectObject)


