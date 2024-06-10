from rest_framework import permissions
from .models import Project

class CanUpdateRetrieveDestroyPermission(permissions.DjangoObjectPermissions):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        elif obj.creator == request.user:
            return True
        return False
    

class ProjectObjectPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        project_id = request.parser_context.get("kwargs").get('project_id')
        project_instance = Project.objects.get(id=project_id)
        if user.is_superuser or user == project_instance.creator:
            return True
        return False
