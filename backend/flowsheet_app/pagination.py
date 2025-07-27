from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response


class CustomPagination(LimitOffsetPagination):
    default_limit = 20
    max_limit = 100

    def get_paginated_response(self, data):
        # Determine if there is a next page by checking if next link exists
        has_next = self.get_next_link() is not None
        has_previous = self.get_previous_link() is not None

        return Response(
            {
                "total": self.count,
                "has_next": has_next,
                "has_previous": has_previous,
                "offset": self.offset,
                "limit": self.limit,
                "results": data,
            }
        )
