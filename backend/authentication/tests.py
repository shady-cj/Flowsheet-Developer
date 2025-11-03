from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from authentication.models import User
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from unittest.mock import patch
import uuid


class UserModelTest(TestCase):
    """Test cases for User model"""

    def test_create_user_with_email_successful(self):
        """Test creating a new user with email is successful"""
        email = "test@example.com"
        password = "testpass123"
        user = User.objects.create_user(email=email, password=password)

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_oauth)

    def test_create_user_email_normalized(self):
        """Test the email for a new user is normalized"""
        email = "test@EXAMPLE.COM"
        user = User.objects.create_user(email=email, password="test123")
        self.assertEqual(user.email, email.lower())

    def test_create_user_without_email_raises_error(self):
        """Test creating user without email raises error"""
        with self.assertRaises(TypeError):
            User.objects.create_user(email=None, password="test123")

    def test_create_user_without_password_raises_error(self):
        """Test creating non-oauth user without password raises error"""
        with self.assertRaises(TypeError):
            User.objects.create_user(email="test@example.com", password=None)

    def test_create_oauth_user_without_provider_raises_error(self):
        """Test creating oauth user without provider raises error"""
        with self.assertRaises(TypeError):
            User.objects.create_user(
                email="test@example.com",
                password=None,
                is_oauth=True
            )

    def test_create_oauth_user_with_provider_successful(self):
        """Test creating oauth user with provider is successful"""
        email = "oauth@example.com"
        user = User.objects.create_user(
            email=email,
            password=None,
            is_oauth=True,
            provider="google"
        )
        self.assertEqual(user.email, email)
        self.assertTrue(user.is_oauth)
        self.assertEqual(user.provider, "google")

    def test_create_superuser(self):
        """Test creating a superuser"""
        email = "admin@example.com"
        password = "admin123"
        user = User.objects.create_superuser(email=email, password=password)

        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

    def test_user_str_representation(self):
        """Test the user string representation"""
        email = "test@example.com"
        user = User.objects.create_user(email=email, password="test123")
        self.assertEqual(str(user), email)


class RegisterUserViewTest(APITestCase):
    """Test cases for user registration"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')

    def test_register_user_successful(self):
        """Test registering a user is successful"""
        payload = {
            'email': 'newuser@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(self.register_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email=payload['email'])
        self.assertTrue(user.check_password(payload['password']))
        self.assertNotIn('password', response.data)

    def test_register_user_with_short_password_fails(self):
        """Test registering user with password less than 8 characters fails"""
        payload = {
            'email': 'newuser@example.com',
            'password': 'test123'  # Only 7 characters
        }
        response = self.client.post(self.register_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_register_user_with_existing_email_fails(self):
        """Test registering user with existing email fails"""
        User.objects.create_user(email='existing@example.com', password='testpass123')
        payload = {
            'email': 'existing@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(self.register_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_without_email_fails(self):
        """Test registering user without email fails"""
        payload = {'password': 'testpass123'}
        response = self.client.post(self.register_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_without_password_fails(self):
        """Test registering user without password fails"""
        payload = {'email': 'test@example.com'}
        response = self.client.post(self.register_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RetrieveUserViewTest(APITestCase):
    """Test cases for retrieving authenticated user"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.retrieve_url = reverse('get_user')

    def test_retrieve_user_authenticated(self):
        """Test retrieving user profile when authenticated"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.retrieve_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)
        self.assertEqual(response.data['id'], str(self.user.id))

    def test_retrieve_user_unauthenticated_fails(self):
        """Test retrieving user profile when not authenticated fails"""
        response = self.client.get(self.retrieve_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class OauthAuthenticationTest(APITestCase):
    """Test cases for OAuth authentication"""

    def setUp(self):
        self.client = APIClient()
        self.oauth_url = reverse('oauth-auth')

    def test_oauth_login_new_user(self):
        """Test OAuth login creates new user"""
        payload = {
            'email': 'oauth@example.com',
            'provider': 'google'
        }
        response = self.client.post(self.oauth_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        user = User.objects.get(email=payload['email'])
        self.assertTrue(user.is_oauth)
        self.assertEqual(user.provider, 'google')

    def test_oauth_login_existing_oauth_user(self):
        """Test OAuth login with existing OAuth user"""
        email = 'oauth@example.com'
        User.objects.create_user(
            email=email,
            password=None,
            is_oauth=True,
            provider='google'
        )
        payload = {
            'email': email,
            'provider': 'google'
        }
        response = self.client.post(self.oauth_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_oauth_login_different_provider_fails(self):
        """Test OAuth login with different provider fails"""
        email = 'oauth@example.com'
        User.objects.create_user(
            email=email,
            password=None,
            is_oauth=True,
            provider='google'
        )
        payload = {
            'email': email,
            'provider': 'facebook'
        }
        response = self.client.post(self.oauth_url, payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_oauth_login_regular_user_fails(self):
        """Test OAuth login with regular (non-oauth) user fails"""
        email = 'regular@example.com'
        User.objects.create_user(email=email, password='testpass123')
        payload = {
            'email': email,
            'provider': 'google'
        }
        response = self.client.post(self.oauth_url, payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PasswordResetTest(APITestCase):
    """Test cases for password reset functionality"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='oldpass123'
        )
        self.request_reset_url = reverse('request_password_reset')
        self.verify_url = reverse('password_reset_verification')
        self.reset_url = reverse('password_reset')

    @patch('authentication.views.Thread')
    def test_request_password_reset_successful(self, mock_thread):
        """Test requesting password reset sends email"""
        payload = {
            'email': self.user.email,
            'host': 'http://localhost:3000'
        }
        response = self.client.post(self.request_reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        mock_thread.assert_called_once()
        
        # Check that token was set
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.password_reset_token)

    def test_request_password_reset_nonexistent_email(self):
        """Test requesting password reset with non-existent email"""
        payload = {
            'email': 'nonexistent@example.com',
            'host': 'http://localhost:3000'
        }
        response = self.client.post(self.request_reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_request_password_reset_without_email(self):
        """Test requesting password reset without email"""
        payload = {'host': 'http://localhost:3000'}
        response = self.client.post(self.request_reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_request_password_reset_inactive_user(self):
        """Test requesting password reset for inactive user"""
        self.user.is_active = False
        self.user.save()
        payload = {
            'email': self.user.email,
            'host': 'http://localhost:3000'
        }
        response = self.client.post(self.request_reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_request_password_reset_oauth_user(self):
        """Test requesting password reset for OAuth user fails"""
        oauth_user = User.objects.create_user(
            email='oauth@example.com',
            password=None,
            is_oauth=True,
            provider='google'
        )
        payload = {
            'email': oauth_user.email,
            'host': 'http://localhost:3000'
        }
        response = self.client.post(self.request_reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_valid_token(self):
        """Test verifying valid password reset token"""
        token = AccessToken()
        token['email'] = self.user.email
        self.user.password_reset_token = str(token)
        self.user.save()

        payload = {'token': str(token)}
        response = self.client.post(self.verify_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)

    def test_verify_invalid_token(self):
        """Test verifying invalid token"""
        payload = {'token': 'invalid_token'}
        response = self.client.post(self.verify_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_token_without_token(self):
        """Test verifying without providing token"""
        response = self.client.post(self.verify_url, {})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_successful(self):
        """Test resetting password successfully"""
        token = AccessToken()
        token['email'] = self.user.email
        self.user.password_reset_token = str(token)
        self.user.save()

        payload = {
            'token': str(token),
            'email': self.user.email,
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        response = self.client.post(self.reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpass123'))
        self.assertIsNone(self.user.password_reset_token)

    def test_password_reset_mismatched_passwords(self):
        """Test password reset with mismatched passwords"""
        token = AccessToken()
        token['email'] = self.user.email
        self.user.password_reset_token = str(token)
        self.user.save()

        payload = {
            'token': str(token),
            'email': self.user.email,
            'new_password': 'newpass123',
            'confirm_password': 'differentpass123'
        }
        response = self.client.post(self.reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_short_password(self):
        """Test password reset with short password"""
        token = AccessToken()
        token['email'] = self.user.email
        self.user.password_reset_token = str(token)
        self.user.save()

        payload = {
            'token': str(token),
            'email': self.user.email,
            'new_password': 'short',
            'confirm_password': 'short'
        }
        response = self.client.post(self.reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_same_as_old_password(self):
        """Test password reset with same password as old"""
        token = AccessToken()
        token['email'] = self.user.email
        self.user.password_reset_token = str(token)
        self.user.save()

        payload = {
            'token': str(token),
            'email': self.user.email,
            'new_password': 'oldpass123',
            'confirm_password': 'oldpass123'
        }
        response = self.client.post(self.reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_invalid_token(self):
        """Test password reset with invalid token"""
        payload = {
            'token': 'invalid_token',
            'email': self.user.email,
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        response = self.client.post(self.reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_reset_without_token(self):
        """Test password reset without token"""
        payload = {
            'email': self.user.email,
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        response = self.client.post(self.reset_url, payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class JWTAuthenticationTest(APITestCase):
    """Test JWT token authentication"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.token_url = '/auth/token/'
        self.refresh_url = '/auth/token/refresh/'
        self.verify_url = '/auth/token/verify/'

    def test_obtain_token_pair_successful(self):
        """Test obtaining JWT token pair"""
        payload = {
            'email': self.user.email,
            'password': 'testpass123'
        }
        response = self.client.post(self.token_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_invalid_credentials(self):
        """Test obtaining token with invalid credentials"""
        payload = {
            'email': self.user.email,
            'password': 'wrongpassword'
        }
        response = self.client.post(self.token_url, payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_successful(self):
        """Test refreshing access token"""
        refresh = RefreshToken.for_user(self.user)
        payload = {'refresh': str(refresh)}
        response = self.client.post(self.refresh_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_verify_token_successful(self):
        """Test verifying valid token"""
        refresh = RefreshToken.for_user(self.user)
        payload = {'token': str(refresh.access_token)}
        response = self.client.post(self.verify_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_verify_invalid_token(self):
        """Test verifying invalid token"""
        payload = {'token': 'invalid_token'}
        response = self.client.post(self.verify_url, payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)