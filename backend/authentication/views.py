from django.shortcuts import render

from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer
from rest_framework import permissions
from rest_framework.response import Response
# Create your views here.


class RegisterUserView(CreateAPIView):
    permission_classes = (permissions.AllowAny, )
    serializer_class = UserSerializer
    queryset = User.objects.all()



class RetrieveUserView(APIView):
    permission_classes = (permissions.IsAuthenticated, )
    def get(self, request, format=None):
        # returning the current user
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)



