from django.shortcuts import render

from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

# Create your views here.


class RegisterUserView(CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer
    queryset = User.objects.all()


class RetrieveUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None):
        # returning the current user
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class OauthAuthentication(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        data = request.data
        provider = data.get("provider")
        email = data.get("email")
        user = None
        try:
            user = User.objects.get(email=email)
            if not (user.is_oauth and user.provider == provider):
                return Response(
                    {
                        "error": "This email is registered with a different authentication method, try a different provider or login manually with email and password."
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        except User.DoesNotExist:
            user = User.objects.create_user(
                email=email, is_oauth=True, provider=provider
            )
        refresh = RefreshToken.for_user(user)

        return Response(
            {"refresh": str(refresh), "access": str(refresh.access_token)},
            status=status.HTTP_200_OK,
        )
