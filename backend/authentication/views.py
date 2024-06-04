from django.shortcuts import render

from rest_framework.generics import CreateAPIView, RetrieveAPIView
from .models import User
from .serializers import UserSerializer
from rest_framework import permissions
# Create your views here.


class RegisterUserView(CreateAPIView):
    permission_classes = (permissions.AllowAny, )
    serializer_class = UserSerializer
    queryset = User.objects.all()

class RetrieveUserView(RetrieveAPIView):
    lookup_field = "pk"
    queryset = User.objects.all()
    serializer_class = UserSerializer


