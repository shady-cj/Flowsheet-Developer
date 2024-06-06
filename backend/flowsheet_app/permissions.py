from rest_framework import permissions


class CanUpdateRetrieveDestroyPermission(permissions.DjangoObjectPermissions):
    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        elif obj.creator == request.user:
            return True
        return False
