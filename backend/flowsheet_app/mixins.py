from .permissions import CanUpdateRetrieveDestroyPermission
from .utils import  process_component_image
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.response import Response

class ObjectPermissionMixin():
    permission_classes = [CanUpdateRetrieveDestroyPermission]


class UpdateCreatorMixin():
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
class handleCreationMixin():
    parser_classes = (MultiPartParser, FormParser)
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data = process_component_image(data)
        if not data:
            return Response({"detail": "An error occured with the data"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)