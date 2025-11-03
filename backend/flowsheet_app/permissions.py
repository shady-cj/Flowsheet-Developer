from rest_framework import permissions
from .models import Project, Flowsheet
from django.shortcuts import get_object_or_404
from django.http import Http404
import uuid


class CanUpdateRetrieveDestroyPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        elif request.user.is_superuser:
            return True
        elif obj.creator == request.user:
            return True
        return False 
  

# class FlowsheetInstancePermission(permissions.DjangoObjectPermissions):
#     def has_object_permission(self, request, view, obj):
#         return super().has_object_permission(request, view, obj)


class FlowsheetInstancePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        project_id = request.parser_context.get("kwargs").get("project_id")

        try:
            # check for validity of Uuid
            uuid.UUID(project_id, version=4)
        except ValueError:
            raise Http404()
        project_instance = get_object_or_404(Project, pk=project_id)
        if request.method in permissions.SAFE_METHODS:
            return True
        if user.is_superuser or user == project_instance.creator:
            return True
        return False


class FlowsheetObjectPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        flowsheet_id = request.parser_context.get("kwargs").get("flowsheet_id")

        try:
            # check for validity of Uuid
            uuid.UUID(flowsheet_id, version=4)
        except ValueError:
            raise Http404()
        project_instance = get_object_or_404(Flowsheet, pk=flowsheet_id).project
        if request.method in permissions.SAFE_METHODS:
            return True
        if user.is_superuser or user == project_instance.creator:
            return True
        return False
