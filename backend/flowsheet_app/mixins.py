from .permissions import CanUpdateRetrieveDestroyPermission


class ObjectPermissionMixin():
    permission_classes = [CanUpdateRetrieveDestroyPermission]


class UpdateCreatorMixin():
    def perform_create(self, serializer):
        print("called here")
        serializer.save(creator=self.request.user)