from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import User


class UserSerializer(ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id", 
            "email", 
            "password",
            "projects"
        ]

        depth = 1
        extra_kwargs = {
            "password": {"write_only": True}
        }
        read_only_fields = ["id", "projects"]
    

    
    def create(self, validated_data):
        email = validated_data.get('email').strip()
        password = validated_data.get('password').strip()
        if len(password) < 8:
            raise serializers.ValidationError({"password": "password must be atleast 8 in length"})
        user = User.objects.create_user(email, password)
        return user
    

