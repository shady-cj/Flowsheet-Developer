from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import User


class UserSerializer(ModelSerializer):
    projects = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "uid", 
            "email", 
            "password",
            "projects"
        ]
        extra_kwargs = {
            "password": {"write_only": True}
        }
        read_only_fields = ["uid", "projects"]
    

    def get_projects(self, instance):
        return instance.projects.all()
    
    def create(self, validated_data):
        email = validated_data.get('email').strip()
        password = validated_data.get('password').strip()
        confirm_password = validated_data.get('confirm_password').strip()
        if len(password) <= 8:
            raise serializers.ValidationError({"password": "password must be atleast 8 in length"})
        
        if password != confirm_password:
            raise serializers.ValidationError({"password": "passwords do not match"})
        user = User.objects.create_user(email, password)
        return user
    

