from .views import RegisterUserView, RetrieveUserView

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView,TokenVerifyView


urlpatterns = [
    path('register/', RegisterUserView.as_view(), name="register"),
    path('user/', RetrieveUserView.as_view(), name="get_user"), 
    path('token/',TokenObtainPairView.as_view()),
    path('token/refresh/',TokenRefreshView.as_view()),
    path('token/verify/',TokenVerifyView.as_view()),
]