from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import User


class UserSerializer(ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "email", "password", "projects"]

        depth = 1
        extra_kwargs = {"password": {"write_only": True}}
        read_only_fields = ["id", "projects"]

    def create(self, validated_data):
        email = validated_data.get("email").strip()
        password = validated_data.get("password").strip()
        if len(password) < 8:
            raise serializers.ValidationError(
                {"password": "password must be atleast 8 in length"}
            )
        user = User.objects.create_user(email, password)
        return user


class PasswordChangeSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")
        if new_password != confirm_password:
            raise serializers.ValidationError(
                "New password and confirm password do not match."
            )
        if len(new_password) < 8:
            raise serializers.ValidationError(
                "New password must be at least 8 characters long."
            )
        return attrs

    def save(self, **kwargs):
        user = self.context["user"]
        new_password = self.validated_data["new_password"]
        if not user.check_password(new_password):
            user.set_password(new_password)
            user.save()
        else:
            raise serializers.ValidationError(
                "New password cannot be the same as the old password."
            )
