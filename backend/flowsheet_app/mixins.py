from .permissions import CanUpdateRetrieveDestroyPermission
from .utils import process_component_image
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .cache_utils import get_cache_data, cache_data

class ObjectPermissionMixin:
    permission_classes = [IsAuthenticated, CanUpdateRetrieveDestroyPermission]


class UpdateCreatorMixin:
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class handleCreationMixin:
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data = process_component_image(data)
        if not data:
            return Response(
                {"detail": "An error occured with the data"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )
    
class ListComponentMixin:
    from .cache_utils import get_cache_data, cache_data
    def list(self, request, *args, **kwargs):
        user = request.user
        get_full_path = request.get_full_path()
        cache_key = f"user:{user.id}:{get_full_path}"

        cache_result = get_cache_data(cache_key)
        if cache_result:
            print(cache_result)
            return Response(cache_result["data"], status=cache_result["status"])
        
        response = super().list(request, args, kwargs)
        cache_data(cache_key, {"data": response.data, "status": response.status_code})
        return response

