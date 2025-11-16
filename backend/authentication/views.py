from django.shortcuts import render

from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer, PasswordChangeSerializer
from rest_framework import permissions, status
from rest_framework.response import Response
from threading import Thread
from rest_framework_simplejwt.tokens import RefreshToken
from flowsheet_app.cache_utils import cache_data, get_cache_data
from .utils import create_reset_link, send_password_reset_email, validate_reset_token


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
        cache_key = f"user-detail-{user.id}"
        cache_result = get_cache_data(cache_key)
        if (cache_result):
            return Response(cache_result)

        serializer = UserSerializer(user)
        data = serializer.data
        cache_data(cache_key, data)
        return Response(data)


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


class RequestPasswordResetView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        email = request.data.get("email")
        host = request.data.get("host")
        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email=email)
            if not user.is_active:
                return Response(
                    {"error": "This account is inactive."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if user.is_oauth:
                return Response(
                    {
                        "error": "This account is registered via a different authentication method."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # print("host", host)
            reset_link = create_reset_link(host, user)

            # Using a thread to send the email asynchronously
            Thread(
                target=send_password_reset_email,
                args=(user, reset_link),
            ).start()
            # Here you would typically send an email with a reset link
            # For simplicity, we will just return a success message
            return Response(
                {"message": "Password reset link has been sent to your email."},
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )


class PasswordResetVerificationView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "Token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:

            validated_token = validate_reset_token(token)
            if not validated_token:
                return Response(
                    {"error": "Invalid or expired token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user_email = validated_token["email"]

            user = User.objects.get(email=user_email)
            if not user.password_reset_token or user.password_reset_token != token:
                return Response(
                    {"error": "Invalid token / Expired Link."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Token is valid, proceed with password reset
            return Response(
                {"email": user_email, "message": "Token is valid."},
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class PasswordResetView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        token = request.data.get("token")
        if not token:
            return Response(
                {"error": "Token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        email = request.data.get("email")

        try:
            # validated_token = validate_reset_token(token)
            # Giving the user the grace of resetting their password, as far as they clicked the reset password link
            # This approach means that the token might have expired at this point but the user can still reset their password as long as the token is still associated to their account

            user = User.objects.get(email=email)
            if not user.password_reset_token or user.password_reset_token != token:
                return Response(
                    {"error": "Invalid token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.password_reset_token = None  # Clear the token after use
            user.save()

            serializer = PasswordChangeSerializer(
                data={
                    "new_password": new_password,
                    "confirm_password": confirm_password,
                },
                context={"user": user},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(
                {
                    "message": "Password has been reset successfully, You can now login with your new password."
                },
                status=status.HTTP_200_OK,
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
