from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from authentication.models import User
from flowsheet_app.models import (
    Shape, Screener, Crusher, Grinder, Concentrator, Auxilliary,
    Project, Flowsheet, FlowsheetObject, FeedBack
)
from unittest.mock import patch
from django.contrib.contenttypes.models import ContentType

from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from io import BytesIO
import json
import uuid


class ModelTests(TestCase):
    """Test cases for models"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_shape_creation(self):
        """Test creating a shape"""
        shape = Shape.objects.create(name='Circle')
        self.assertEqual(shape.name, 'Circle')
        self.assertIsNotNone(shape.id)

    def test_screener_creation(self):
        """Test creating a screener"""
        screener = Screener.objects.create(
            name='Vibrating Screen',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        self.assertEqual(screener.name, 'Vibrating Screen')
        self.assertEqual(screener.creator, self.user)

    def test_crusher_creation(self):
        """Test creating a crusher"""
        crusher = Crusher.objects.create(
            name='Jaw Crusher',
            image_url='http://example.com/crusher.png',
            creator=self.user
        )
        self.assertEqual(crusher.name, 'Jaw Crusher')

    def test_grinder_creation(self):
        """Test creating a grinder"""
        grinder = Grinder.objects.create(
            name='Ball Mill',
            image_url='http://example.com/grinder.png',
            creator=self.user
        )
        self.assertEqual(grinder.name, 'Ball Mill')

    def test_concentrator_creation(self):
        """Test creating a concentrator"""
        concentrator = Concentrator.objects.create(
            name='Flotation Cell',
            image_url='http://example.com/concentrator.png',
            description='Test concentrator',
            creator=self.user,
            valuable_recoverable=80.0,
            gangue_recoverable=20.0
        )
        self.assertEqual(concentrator.name, 'Flotation Cell')
        self.assertEqual(concentrator.valuable_recoverable, 80.0)

    def test_auxilliary_creation(self):
        """Test creating an auxilliary"""
        auxilliary = Auxilliary.objects.create(
            name='Stockpile',
            image_url='http://example.com/stockpile.png',
            type='STOCKPILE',
            creator=self.user
        )
        self.assertEqual(auxilliary.name, 'Stockpile')
        self.assertEqual(auxilliary.type, 'STOCKPILE')

    def test_project_creation(self):
        """Test creating a project"""
        project = Project.objects.create(
            name='Test Project',
            description='Test description',
            creator=self.user
        )
        self.assertEqual(project.name, 'Test Project')
        self.assertEqual(project.creator, self.user)
        self.assertFalse(project.starred)

    def test_project_get_mins_ago(self):
        """Test project get_mins_ago method"""
        project = Project.objects.create(
            name='Test Project',
            description='Test description',
            creator=self.user
        )
        mins_ago = project.get_mins_ago()
        self.assertIsNotNone(mins_ago)

    def test_flowsheet_creation(self):
        """Test creating a flowsheet"""
        project = Project.objects.create(
            name='Test Project',
            description='Test description',
            creator=self.user
        )
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test flowsheet description',
            project=project
        )
        self.assertEqual(flowsheet.name, 'Test Flowsheet')
        self.assertEqual(flowsheet.project, project)
        self.assertEqual(flowsheet.save_frequency_type, 'MANUAL')

    def test_flowsheet_str_representation(self):
        """Test flowsheet string representation"""
        project = Project.objects.create(
            name='Test Project',
            description='Test description',
            creator=self.user
        )
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test flowsheet description',
            project=project
        )
        expected_str = f"Test Flowsheet ---- project/{project.id}/flowsheet/{flowsheet.id} under project {project.name}"
        self.assertEqual(str(flowsheet), expected_str)

    def test_flowsheet_object_creation(self):
        """Test creating a flowsheet object"""
        project = Project.objects.create(
            name='Test Project',
            description='Test description',
            creator=self.user
        )
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test flowsheet description',
            project=project
        )
        shape = Shape.objects.create(name='Circle')
        
        content_type = ContentType.objects.get_for_model(Shape)
        
        flowsheet_obj = FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shape.id,
            label='Test Object',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=flowsheet
        )
        self.assertEqual(flowsheet_obj.label, 'Test Object')
        self.assertEqual(flowsheet_obj.object, shape)


class ShapeViewTests(APITestCase):
    """Test cases for Shape views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.shapes_url = '/shapes/'

    def test_list_shapes(self):
        """Test listing shapes"""
        Shape.objects.create(name='Circle')
        Shape.objects.create(name='Square')
        
        response = self.client.get(self.shapes_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_shape(self):
        """Test creating a shape"""
        payload = {'name': 'Triangle'}
        response = self.client.post(self.shapes_url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Shape.objects.count(), 1)
        self.assertEqual(Shape.objects.first().name, 'Triangle')

    def test_list_shapes_unauthenticated_fails(self):
        """Test listing shapes without authentication fails"""
        self.client.force_authenticate(user=None)
        response = self.client.get(self.shapes_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ScreenerViewTests(APITestCase):
    """Test cases for Screener views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.superuser = User.objects.create_superuser(
            email='admin@example.com',
            password='admin123'
        )
        self.client.force_authenticate(user=self.user)
        self.screeners_url = '/screeners/'

    def test_list_user_screeners(self):
        """Test listing screeners created by user"""
        Screener.objects.create(
            name='User Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        Screener.objects.create(
            name='Other User Screener',
            image_url='http://example.com/image2.png',
            creator=User.objects.create_user(email='other@example.com', password='test123')
        )
        
        response = self.client.get(self.screeners_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_includes_superuser_screeners(self):
        """Test listing includes screeners created by superuser"""
        Screener.objects.create(
            name='Superuser Screener',
            image_url='http://example.com/image.png',
            creator=self.superuser
        )
        
        response = self.client.get(self.screeners_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    @patch('flowsheet_app.utils.upload')
    @patch('flowsheet_app.utils.remove')
    def test_create_screener(self, mock_remove, mock_upload):
        """Test creating a screener with image"""
        mock_upload.return_value = {'secure_url': 'http://cloudinary.com/image.png'}
        
        image = BytesIO()
        img = Image.new('RGB', (100, 100), color='red')
        mock_remove.return_value = img
        img.save(image, format='PNG')
        image.seek(0)
        
        image_file = SimpleUploadedFile(
            "test_image.png",
            image.getvalue(),
            content_type="image/png"
        )
        
        payload = {
            'name': 'New Screener',
            'image': image_file,
            'folder': 'screeners'
        }
        
        response = self.client.post(
            self.screeners_url,
            payload,
            format='multipart'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Screener.objects.count(), 1)
        screener = Screener.objects.first()
        self.assertEqual(screener.creator, self.user)

    def test_retrieve_screener(self):
        """Test retrieving a screener"""
        screener = Screener.objects.create(
            name='Test Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        url = f'/screeners/{screener.id}'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Screener')

    def test_update_own_screener(self):
        """Test updating own screener"""
        screener = Screener.objects.create(
            name='Test Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        url = f'/screeners/{screener.id}'
        payload = {'name': 'Updated Screener'}
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    
    def test_update_other_user_screener_fails(self):
        """Test updating another user's screener fails"""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='test123'
        )
        screener = Screener.objects.create(
            name='Other Screener',
            image_url='http://example.com/image.png',
            creator=other_user
        )
        url = f'/screeners/{screener.id}'
        payload = {'name': 'Hacked Screener'}
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # Not found query set is filtered to creators and superuser.. 

    def test_superuser_can_update_any_screener(self):
        """Test superuser can update any screener"""
        self.client.force_authenticate(user=self.superuser)
        screener = Screener.objects.create(
            name='Test Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        url = f'/screeners/{screener.id}'
        payload = {'name': 'Admin Updated'}
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)



class ProjectViewTests(APITestCase):
    """Test cases for Project views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='test123'
        )
        self.client.force_authenticate(user=self.user)
        self.projects_url = '/projects/'

    def test_list_user_projects(self):
        """Test listing projects for authenticated user"""
        Project.objects.create(
            name='User Project',
            description='Test',
            creator=self.user
        )
        Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        
        response = self.client.get(self.projects_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_list_projects_with_starred_filter(self):
        """Test listing starred projects"""
        Project.objects.create(
            name='Starred Project',
            description='Test',
            creator=self.user,
            starred=True
        )
        Project.objects.create(
            name='Unstarred Project',
            description='Test',
            creator=self.user,
            starred=False
        )
        
        response = self.client.get(self.projects_url, {'f': 'starred'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertTrue(response.data['results'][0]['starred'])

    def test_list_projects_with_recents_filter(self):
        """Test listing recent projects"""
        Project.objects.create(
            name='Recent Project',
            description='Test',
            creator=self.user
        )
        
        response = self.client.get(self.projects_url, {'f': 'recents'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

    def test_create_project(self):
        """Test creating a project"""
        payload = {
            'name': 'New Project',
            'description': 'New project description'
        }
        
        response = self.client.post(self.projects_url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 1)
        project = Project.objects.first()
        self.assertEqual(project.creator, self.user)
        self.assertEqual(project.name, 'New Project')

    def test_retrieve_own_project(self):
        """Test retrieving own project"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        url = f'/projects/{project.id}'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('project', response.data)
        self.assertIn('flowsheets', response.data)
        self.assertEqual(response.data['project']['name'], 'Test Project')

    def test_retrieve_other_user_project_fails(self):
        """Test retrieving another user's project fails"""
        project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        url = f'/projects/{project.id}'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK) # can view other user's project (SAFE METHODS)

    def test_update_own_project(self):
        """Test updating own project"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        url = f'/projects/{project.id}'
        payload = {'name': 'Updated Project', 'starred': True}
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project.refresh_from_db()
        self.assertEqual(project.name, 'Updated Project')
        self.assertTrue(project.starred)

    def test_delete_own_project(self):
        """Test deleting own project"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        url = f'/projects/{project.id}'
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Project.objects.count(), 0)

    def test_delete_other_user_project_fails(self):
        """Test deleting another user's project fails"""
        project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        url = f'/projects/{project.id}'
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Project.objects.count(), 1)

    def test_project_serializer_is_owner_field(self):
        """Test is_owner field in project serializer"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        url = f'/projects/{project.id}'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_owner'])


class FlowsheetViewTests(APITestCase):
    """Test cases for Flowsheet views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='test123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        self.other_project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )

    def test_list_all_flowsheets(self):
        """Test listing all flowsheets across projects"""
        Flowsheet.objects.create(
            name='Flowsheet 1',
            description='Test',
            project=self.project
        )
        
        response = self.client.get('/flowsheets/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['results']), 0)

    def test_list_flowsheets_by_project(self):
        """Test listing flowsheets for specific project"""
        Flowsheet.objects.create(
            name='Flowsheet 1',
            description='Test',
            project=self.project
        )
        Flowsheet.objects.create(
            name='Flowsheet 2',
            description='Test',
            project=self.project
        )
        
        url = f'/flowsheets/{self.project.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_flowsheets_starred_filter(self):
        """Test listing starred flowsheets"""
        Flowsheet.objects.create(
            name='Starred Flowsheet',
            description='Test',
            project=self.project,
            starred=True
        )
        Flowsheet.objects.create(
            name='Unstarred Flowsheet',
            description='Test',
            project=self.project,
            starred=False
        )
        
        response = self.client.get('/flowsheets/', {'f': 'starred'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        starred_count = sum(1 for fs in response.data['results'] if fs['starred'])
        self.assertGreater(starred_count, 0)

    def test_create_flowsheet(self):
        """Test creating a flowsheet"""
        url = f'/flowsheets/{self.project.id}'
        payload = {
            'name': 'New Flowsheet',
            'description': 'New flowsheet description',
            'footprint': 'none'
        }
        
        response = self.client.post(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Flowsheet.objects.count(), 1)
        flowsheet = Flowsheet.objects.first()
        self.assertEqual(flowsheet.project, self.project)

    def test_create_flowsheet_with_footprint(self):
        """Test creating flowsheet with footprint from existing flowsheet"""
        original_flowsheet = Flowsheet.objects.create(
            name='Original Flowsheet',
            description='Test',
            project=self.project
        )
        shape = Shape.objects.create(name='Circle')
        content_type = ContentType.objects.get_for_model(Shape)
        
        FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shape.id,
            label='Test Object',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=original_flowsheet
        )
        
        url = f'/flowsheets/{self.project.id}'
        payload = {
            'name': 'New Flowsheet',
            'description': 'Copied flowsheet',
            'footprint': str(original_flowsheet.id)
        }
        
        response = self.client.post(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_flowsheet = Flowsheet.objects.get(name='New Flowsheet')
        self.assertEqual(new_flowsheet.flowsheet_objects.count(), 1)
        self.assertEqual(new_flowsheet.flowsheet_objects.first().label, 'Test Object')

    def test_create_flowsheet_in_other_user_project_fails(self):
        """Test creating flowsheet in another user's project fails"""
        url = f'/flowsheets/{self.other_project.id}'
        payload = {
            'name': 'New Flowsheet',
            'description': 'Test',
            'footprint': 'none'
        }
        
        response = self.client.post(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_flowsheet(self):
        """Test retrieving a flowsheet"""
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=self.project
        )
        url = f'/flowsheets/{self.project.id}/update/{flowsheet.id}'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Flowsheet')

    def test_update_flowsheet(self):
        """Test updating a flowsheet"""
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=self.project
        )
        url = f'/flowsheets/{self.project.id}/update/{flowsheet.id}'
        payload = {
            'name': 'Updated Flowsheet',
            'starred': True
        }
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        flowsheet.refresh_from_db()
        self.assertEqual(flowsheet.name, 'Updated Flowsheet')
        self.assertTrue(flowsheet.starred)

    def test_update_flowsheet_with_auto_save_validation(self):
        """Test updating flowsheet with auto save requires frequency"""
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=self.project
        )
        url = f'/flowsheets/{self.project.id}/update/{flowsheet.id}'
        payload = {
            'save_frequency_type': 'AUTO'
        }
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_flowsheet_auto_save_valid(self):
        """Test valid auto save configuration"""
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=self.project
        )
        url = f'/flowsheets/{self.project.id}/update/{flowsheet.id}'
        payload = {
            'save_frequency_type': 'AUTO',
            'save_frequency': 30
        }
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        flowsheet.refresh_from_db()
        self.assertEqual(flowsheet.save_frequency, 30)

    def test_delete_flowsheet(self):
        """Test deleting a flowsheet"""
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=self.project
        )
        url = f'/flowsheets/{self.project.id}/update/{flowsheet.id}'
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Flowsheet.objects.count(), 0)

    def test_delete_flowsheet_in_other_user_project_fails(self):
        """Test deleting flowsheet in another user's project fails"""
        flowsheet = Flowsheet.objects.create(
            name='Other Flowsheet',
            description='Test',
            project=self.other_project
        )
        url = f'/flowsheets/{self.other_project.id}/update/{flowsheet.id}'
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch('flowsheet_app.utils.upload')
    def test_update_flowsheet_preview(self, mock_upload):
        """Test updating flowsheet preview image"""
        mock_upload.return_value = {'secure_url': 'http://cloudinary.com/preview.png'}
        
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=self.project
        )
        url = f'/flowsheets/{flowsheet.id}/update_preview'
        
        base64_image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
        
        payload = {'preview': base64_image}
        
        response = self.client.put(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        flowsheet.refresh_from_db()
        self.assertIsNotNone(flowsheet.preview_url)

    def test_update_flowsheet_auto_save_frequency_too_low(self):
        """Test auto save frequency must be > 10 seconds"""
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=self.project
        )
        url = f'/flowsheets/{self.project.id}/update/{flowsheet.id}'
        payload = {
            'save_frequency_type': 'AUTO',
            'save_frequency': 5
        }
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('greater than 10 seconds', str(response.data))


class FlowsheetObjectViewTests(APITestCase):
    """Test cases for FlowsheetObject views"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='test123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        self.flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=self.project
        )
        self.shape = Shape.objects.create(name='Circle')

    def test_list_flowsheet_objects(self):
        """Test listing flowsheet objects"""
        content_type = ContentType.objects.get_for_model(Shape)
        
        FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=self.shape.id,
            label='Object 1',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=self.flowsheet
        )
        
        url = f'/flowsheet_objects/{self.flowsheet.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_single_flowsheet_object(self):
        """Test creating a single flowsheet object"""
        url = f'/flowsheet_objects/{self.flowsheet.id}'
        payload = {
            'object_info': str({
                'object_model_name': 'Shape',
                'object_id': str(self.shape.id)
            }),
            'label': 'Test Object',
            'x_coordinate': 100.0,
            'y_coordinate': 200.0,
            'scale': {"x": 1.0, "y": 1.0},
            'font_size': 12.0
        }
        
        response = self.client.post(url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FlowsheetObject.objects.count(), 1)

    def test_create_multiple_flowsheet_objects(self):
        """Test creating multiple flowsheet objects"""
        shape2 = Shape.objects.create(name='Square')
        
        url = f'/flowsheet_objects/{self.flowsheet.id}'
        payload = [
            {
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(self.shape.id)
                }),
                'label': 'Object 1',
                'x_coordinate': 100.0,
                'y_coordinate': 200.0,
                'scale': {"x": 1.0, "y": 1.0},
                'font_size': 12.0
            },
            {
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(shape2.id)
                }),
                'label': 'Object 2',
                'x_coordinate': 300.0,
                'y_coordinate': 400.0,
                'scale': {"x": 1.5, "y": 1.0},
                'font_size': 14.0
            }
        ]
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FlowsheetObject.objects.count(), 2)

    def test_create_flowsheet_object_with_screener(self):
        """Test creating flowsheet object with screener"""
        screener = Screener.objects.create(
            name='Test Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        
        url = f'/flowsheet_objects/{self.flowsheet.id}'
        payload = {
            'object_info': str({
                'object_model_name': 'Screener',
                'object_id': str(screener.id)
            }),
            'label': 'Screener Object',
            'x_coordinate': 100.0,
            'y_coordinate': 200.0,
            'scale': {"x": 1.0, "y": 1.0},
            'font_size': 12.0
        }
        
        response = self.client.post(url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_flowsheet_object_unauthorized_object_fails(self):
        """Test creating flowsheet object with unauthorized object fails"""
        other_screener = Screener.objects.create(
            name='Other Screener',
            image_url='http://example.com/image.png',
            creator=self.other_user
        )
        
        url = f'/flowsheet_objects/{self.flowsheet.id}'
        payload = {
            'object_info': str({
                'object_model_name': 'Screener',
                'object_id': str(other_screener.id)
            }),
            'label': 'Unauthorized',
            'x_coordinate': 100.0,
            'y_coordinate': 200.0,
            'scale': {"x": 1.0, "y": 1.0},
            'font_size': 12.0
        }
        
        response = self.client.post(url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_flowsheet_object_invalid_model_name(self):
        """Test creating flowsheet object with invalid model name"""
        url = f'/flowsheet_objects/{self.flowsheet.id}'
        payload = {
            'object_info': str({
                'object_model_name': 'InvalidModel',
                'object_id': str(self.shape.id)
            }),
            'label': 'Invalid',
            'x_coordinate': 100.0,
            'y_coordinate': 200.0,
            'scale':{"x": 2.0, "y": 1.0},
            'font_size': 12.0
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_flowsheet_object_nonexistent_id(self):
        """Test creating flowsheet object with nonexistent object ID"""
        url = f'/flowsheet_objects/{self.flowsheet.id}'
        fake_uuid = str(uuid.uuid4())
        payload = {
            'object_info': str({
                'object_model_name': 'Shape',
                'object_id': fake_uuid
            }),
            'label': 'Nonexistent',
            'x_coordinate': 100.0,
            'y_coordinate': 200.0,
            'scale':{"x": 1.0, "y": 1.0},
            'font_size': 12.0
        }
        
        response = self.client.post(url, payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_flowsheet_objects(self):
        """Test updating flowsheet objects"""
        content_type = ContentType.objects.get_for_model(Shape)
        
        obj1 = FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=self.shape.id,
            label='Object 1',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=self.flowsheet
        )
        
        url = f'/flowsheet_objects/{self.flowsheet.id}/update'
        payload = [
            {
                'id': obj1.id,
                'oid': str(obj1.oid),
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(self.shape.id)
                }),
                'label': 'Updated Object',
                'x_coordinate': 150.0,
                'y_coordinate': 250.0,
                'scale': {"x": 1.5, "y": 1.25},
                'font_size': 14.0
            }
        ]
        
        response = self.client.put(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        obj1.refresh_from_db()
        self.assertEqual(obj1.label, 'Updated Object')
        self.assertEqual(float(obj1.x_coordinate), 150.0)

    def test_update_flowsheet_objects_add_new(self):
        """Test updating flowsheet objects and adding new ones"""
        content_type = ContentType.objects.get_for_model(Shape)
        
        obj1 = FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=self.shape.id,
            label='Object 1',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=self.flowsheet
        )
        
        shape2 = Shape.objects.create(name='Square')
        
        url = f'/flowsheet_objects/{self.flowsheet.id}/update'
        payload = [
            {
                'id': obj1.id,
                'oid': str(obj1.oid),
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(self.shape.id)
                }),
                'label': 'Object 1',
                'x_coordinate': 100.0,
                'y_coordinate': 200.0,
                'scale': {"x": 1.0, "y": 1.0},
                'font_size': 12.0
            },
            {
                'oid': str(uuid.uuid4()),
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(shape2.id)
                }),
                'label': 'New Object',
                'x_coordinate': 300.0,
                'y_coordinate': 400.0,
                'scale': {"x": 1.0, "y": 1.0},
                'font_size': 12.0
            }
        ]
        
        response = self.client.put(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(FlowsheetObject.objects.count(), 2)

    def test_update_flowsheet_objects_delete_removed(self):
        """Test updating flowsheet objects deletes removed ones"""
        content_type = ContentType.objects.get_for_model(Shape)
        
        obj1 = FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=self.shape.id,
            label='Object 1',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=self.flowsheet
        )
        
        obj2 = FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=self.shape.id,
            label='Object 2',
            x_coordinate=300.0,
            y_coordinate=400.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=self.flowsheet
        )
        
        url = f'/flowsheet_objects/{self.flowsheet.id}/update'
        payload = [
            {
                'id': obj1.id,
                'oid': str(obj1.oid),
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(self.shape.id)
                }),
                'label': 'Object 1',
                'x_coordinate': 100.0,
                'y_coordinate': 200.0,
                'scale': {"x": 1.0, "y": 1.0},
                'font_size': 12.0
            }
        ]
        
        response = self.client.put(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(FlowsheetObject.objects.count(), 1)
        self.assertFalse(FlowsheetObject.objects.filter(id=obj2.id).exists())

    def test_update_flowsheet_objects_not_list_fails(self):
        """Test updating flowsheet objects without list fails"""
        url = f'/flowsheet_objects/{self.flowsheet.id}/update'
        payload = {
            'label': 'Single Object'
        }
        
        response = self.client.put(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_destroy_flowsheet_object(self):
        """Test destroying a component object"""
        screener = Screener.objects.create(
            name='Test Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        
        url = '/flowsheet_objects/destroy/'
        payload = {
            'objectId': str(screener.id),
            'objectType': 'Screener'
        }
        
        response = self.client.delete(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Screener.objects.filter(id=screener.id).exists())

    def test_destroy_object_in_use_fails(self):
        """Test destroying object that's in use by flowsheets"""
        
        screener = Screener.objects.create(
            name='Test Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        
        content_type = ContentType.objects.get_for_model(Screener)
        FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=screener.id,
            label='Screener Object',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=self.flowsheet
        )
        
        url = '/flowsheet_objects/destroy/'
        payload = {
            'objectId': str(screener.id),
            'objectType': 'Screener'
        }
        
        response = self.client.delete(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertTrue(Screener.objects.filter(id=screener.id).exists())

    def test_destroy_other_user_object_fails(self):
        """Test destroying another user's object fails"""
        screener = Screener.objects.create(
            name='Other Screener',
            image_url='http://example.com/image.png',
            creator=self.other_user
        )
        
        url = '/flowsheet_objects/destroy/'
        payload = {
            'objectId': str(screener.id),
            'objectType': 'Screener'
        }
        
        response = self.client.delete(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DashboardSearchTests(APITestCase):
    """Test cases for dashboard search"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.project1 = Project.objects.create(
            name='Mining Project',
            description='Test',
            creator=self.user
        )
        self.project2 = Project.objects.create(
            name='Processing Plant',
            description='Test',
            creator=self.user
        )
        self.flowsheet1 = Flowsheet.objects.create(
            name='Mining Flowsheet',
            description='Test',
            project=self.project1
        )
        
        self.url = '/dashboard_search/'

    def test_search_projects_by_name(self):
        """Test searching projects by name"""
        response = self.client.get(self.url, {'q': 'Mining'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('projects', response.data)
        self.assertIn('flowsheets', response.data)
        self.assertEqual(len(response.data['projects']), 1)
        self.assertEqual(response.data['projects'][0]['name'], 'Mining Project')

    def test_search_flowsheets_by_name(self):
        """Test searching flowsheets by name"""
        response = self.client.get(self.url, {'q': 'Mining'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['flowsheets']), 1)
        self.assertEqual(response.data['flowsheets'][0]['name'], 'Mining Flowsheet')

    def test_search_case_insensitive(self):
        """Test search is case insensitive"""
        response = self.client.get(self.url, {'q': 'mining'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['projects']), 0)

    def test_search_partial_match(self):
        """Test search with partial match"""
        response = self.client.get(self.url, {'q': 'Min'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data['projects']), 0)

    def test_search_short_query_returns_empty(self):
        """Test search with query < 3 characters returns empty"""
        response = self.client.get(self.url, {'q': 'Mi'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_search_without_query_returns_empty(self):
        """Test search without query parameter returns empty"""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_search_no_results(self):
        """Test search with no matching results"""
        response = self.client.get(self.url, {'q': 'NonexistentTerm'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['projects']), 0)
        self.assertEqual(len(response.data['flowsheets']), 0)

    def test_search_only_returns_user_data(self):
        """Test search only returns current user's data"""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='test123'
        )
        other_project = Project.objects.create(
            name='Other Mining Project',
            description='Test',
            creator=other_user
        )
        
        response = self.client.get(self.url, {'q': 'Mining'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project_names = [p['name'] for p in response.data['projects']]
        self.assertNotIn('Other Mining Project', project_names)


class FeedbackViewTests(APITestCase):
    """Test cases for feedback submission"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.url = '/feedbacks/'

    @patch('flowsheet_app.utils.upload')
    def test_submit_feedback_with_screenshots(self, mock_upload):
        """Test submitting feedback with screenshots"""
        mock_upload.return_value = {'secure_url': 'http://cloudinary.com/screenshot.png'}
        
        image1 = BytesIO()
        img1 = Image.new('RGB', (100, 100), color='red')
        img1.save(image1, format='PNG')
        image1.seek(0)
        
        image_file = SimpleUploadedFile(
            "screenshot.png",
            image1.getvalue(),
            content_type="image/png"
        )
        
        payload = {
            'description': 'This is a test feedback',
            'screenshots': [image_file]
        }
        
        response = self.client.post(self.url, payload, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(FeedBack.objects.count(), 1)

    def test_submit_feedback_without_screenshots(self):
        """Test submitting feedback without screenshots"""
        payload = {
            'description': 'Feedback without images'
        }
        
        response = self.client.post(self.url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        feedback = FeedBack.objects.first()
        self.assertEqual(feedback.description, 'Feedback without images')


class PermissionTests(APITestCase):
    """Test cases for permissions"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.superuser = User.objects.create_superuser(
            email='admin@example.com',
            password='admin123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='test123'
        )

    def test_superuser_can_see_all_objects(self):
        """Test superuser can see all objects"""
        self.client.force_authenticate(user=self.superuser)
        
        Screener.objects.create(
            name='User Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        Screener.objects.create(
            name='Other Screener',
            image_url='http://example.com/image2.png',
            creator=self.other_user
        )
        
        response = self.client.get('/screeners/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_user_can_view_other_user_project(self):
        """Test user can view another user's project"""
        self.client.force_authenticate(user=self.user)
        
        other_project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        
        url = f'/projects/{other_project.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    
    def test_user_cannot_edit_other_user_project(self):
        """
        Test user cannot edit or delete another user's project
        """
        self.client.force_authenticate(user=self.user)
        
        other_project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        url = f'/projects/{other_project.id}'
        response = self.client.patch(url, {"name": "Project edited by User"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_can_view_other_user_flowsheet_detail_view(self):
        """
        Test user can view other user's flowsheet
        """
        
        self.client.force_authenticate(user=self.user)
        
        other_project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        other_flowsheet = Flowsheet.objects.create(
            name='Other Flowsheet',
            description='Test',
            project=other_project
        )

        url = f'/flowsheets/{other_project.id}/update/{other_flowsheet.id}'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_cant_edit_other_user_flowsheet_detail_view(self):
        """
        Test user can't edit other user's flowsheet
        """
        
        self.client.force_authenticate(user=self.user)
        
        other_project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        other_flowsheet = Flowsheet.objects.create(
            name='Other Flowsheet',
            description='Test',
            project=other_project
        )

        url = f'/flowsheets/{other_project.id}/update/{other_flowsheet.id}'
        
        response = self.client.patch(url, {"name": "Unauthorized flowsheet"})
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_user_can_view_other_user_flowsheet_object_detail_view(self):
        """
        Test user can view other user's flowsheet
        """
        
        self.client.force_authenticate(user=self.user)
        
        other_project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        other_flowsheet = Flowsheet.objects.create(
            name='Other Flowsheet',
            description='Test',
            project=other_project
        )

        shp = Shape.objects.create(name='Circle')

        content_type = ContentType.objects.get_for_model(Shape)


        FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shp.id,
            label='Object 1',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=other_flowsheet
        )
        
        FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shp.id,
            label='Object 2',
            x_coordinate=300.0,
            y_coordinate=400.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=other_flowsheet
        )
        url = f'/flowsheet_objects/{other_flowsheet.id}'
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_user_cant_edit_other_user_flowsheet_object_detail_view(self):
        """
        Test user can't edit other user's flowsheet
        """
        
        self.client.force_authenticate(user=self.user)
        
        other_project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=self.other_user
        )
        other_flowsheet = Flowsheet.objects.create(
            name='Other Flowsheet',
            description='Test',
            project=other_project
        )

        shp = Shape.objects.create(name='Circle')

        content_type = ContentType.objects.get_for_model(Shape)


        obj = FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shp.id,
            label='Object 1',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=other_flowsheet
        )
        
        FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shp.id,
            label='Object 2',
            x_coordinate=300.0,
            y_coordinate=400.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=other_flowsheet
        )

        payload = [
            {
                'id': obj.id,
                'oid': str(obj.oid),
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(shp.id)
                }),
                'label': 'Unauthorized Updated Object',
                'x_coordinate': 150.0,
                'y_coordinate': 250.0,
                'scale': {"x": 1.5, "y": 1.5},
                'font_size': 14.0
            }
        ]
        url = f'/flowsheet_objects/{other_flowsheet.id}/update'
        
        response = self.client.put(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    

    def test_invalid_uuid_returns_404(self):
        """Test invalid UUID in URL returns 404"""
        self.client.force_authenticate(user=self.user)
        
        url = '/flowsheets/invalid-uuid'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class UtilityFunctionTests(TestCase):
    """Test cases for utility functions"""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_object_formatter_shape(self):
        """Test object_formatter with Shape"""
        from flowsheet_app.utils import object_formatter
        
        shape = Shape.objects.create(name='Circle')
        result = object_formatter(shape)
        
        self.assertEqual(result['name'], 'Circle')
        self.assertEqual(result['model_name'], 'Shape')
        self.assertNotIn('image_url', result)

    def test_object_formatter_concentrator(self):
        """Test object_formatter with Concentrator"""
        from flowsheet_app.utils import object_formatter
        
        concentrator = Concentrator.objects.create(
            name='Flotation Cell',
            image_url='http://example.com/image.png',
            description='Test',
            creator=self.user,
            valuable_recoverable=80.0,
            gangue_recoverable=20.0
        )
        result = object_formatter(concentrator)
        
        self.assertEqual(result['name'], 'Flotation Cell')
        self.assertIn('valuable_recoverable', result)
        self.assertIn('gangue_recoverable', result)
        self.assertIn('description', result)

    def test_object_formatter_auxilliary(self):
        """Test object_formatter with Auxilliary"""
        from flowsheet_app.utils import object_formatter
        
        auxilliary = Auxilliary.objects.create(
            name='Stockpile',
            image_url='http://example.com/image.png',
            type='STOCKPILE',
            creator=self.user
        )
        result = object_formatter(auxilliary)
        
        self.assertEqual(result['name'], 'Stockpile')
        self.assertIn('type', result)
        self.assertIn('description', result)


class PaginationTests(APITestCase):
    """Test cases for pagination"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_project_pagination(self):
        """Test project list pagination"""
        for i in range(25):
            Project.objects.create(
                name=f'Project {i}',
                description='Test',
                creator=self.user
            )
        
        response = self.client.get('/projects/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('has_next', response.data)
        self.assertIn('has_previous', response.data)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['total'], 25)
        self.assertTrue(response.data['has_next'])
        self.assertEqual(len(response.data['results']), 20)

    def test_pagination_with_offset(self):
        """Test pagination with offset parameter"""
        for i in range(25):
            Project.objects.create(
                name=f'Project {i}',
                description='Test',
                creator=self.user
            )
        
        response = self.client.get('/projects/', {'offset': 20})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 5)
        self.assertFalse(response.data['has_next'])
        self.assertTrue(response.data['has_previous'])

    def test_pagination_with_limit(self):
        """Test pagination with custom limit"""
        for i in range(25):
            Project.objects.create(
                name=f'Project {i}',
                description='Test',
                creator=self.user
            )
        
        response = self.client.get('/projects/', {'offset': 20, "limit": 5})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 5)
        self.assertFalse(response.data['has_next'])
        self.assertTrue(response.data['has_previous'])
        
        
        response = self.client.get('/projects/', {'offset': 10, "limit": 10})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 10)
        self.assertTrue(response.data['has_next'])
        self.assertTrue(response.data['has_previous'])
        
    


class EdgeCaseTests(APITestCase):
    """Test cases for edge cases and error handling"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_project_with_empty_name(self):
        """Test creating project with empty name"""
        payload = {
            'name': '',
            'description': 'Test'
        }
        
        response = self.client.post('/projects/', payload)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_project_with_missing_description(self):
        """Test creating project without description"""
        payload = {
            'name': 'Test Project'
        }
        
        response = self.client.post('/projects/', payload)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_flowsheet_with_invalid_project_id(self):
        """Test accessing flowsheet with invalid project ID"""
        response = self.client.get('/flowsheets/invalid-id')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_flowsheet_with_nonexistent_project_id(self):
        """Test accessing flowsheet with nonexistent project ID"""
        fake_uuid = str(uuid.uuid4())
        response = self.client.get(f'/flowsheets/{fake_uuid}')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_flowsheet_object_with_properties(self):
        """Test creating flowsheet object with custom properties"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=project
        )
        shape = Shape.objects.create(name='Circle')
        
        url = f'/flowsheet_objects/{flowsheet.id}'
        payload = {
            'object_info': str({
                'object_model_name': 'Shape',
                'object_id': str(shape.id)
            }),
            'label': 'Test Object',
            'x_coordinate': 100.0,
            'y_coordinate': 200.0,
            'scale': {"x": 1.0, "y": 1.0},
            'font_size': 12.0,
            'properties': {'color': 'red', 'size': 'large'}
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        obj = FlowsheetObject.objects.first()
        self.assertEqual(obj.properties['color'], 'red')

    def test_flowsheet_object_serializer_returns_formatted_object(self):
        """Test FlowsheetObject serializer returns formatted object"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=project
        )
        concentrator = Concentrator.objects.create(
            name='Flotation Cell',
            image_url='http://example.com/image.png',
            description='Test concentrator',
            creator=self.user,
            valuable_recoverable=80.0,
            gangue_recoverable=20.0
        )
        
        from django.contrib.contenttypes.models import ContentType
        content_type = ContentType.objects.get_for_model(Concentrator)
        
        FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=concentrator.id,
            label='Concentrator Object',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=flowsheet
        )
        
        url = f'/flowsheet_objects/{flowsheet.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        obj_data = response.data[0]
        self.assertIn('object', obj_data)
        self.assertEqual(obj_data['object']['name'], 'Flotation Cell')
        self.assertIn('valuable_recoverable', obj_data['object'])

    def test_update_flowsheet_last_edited_on_save(self):
        """Test flowsheet last_edited updates on save"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=project
        )
        
        original_last_edited = flowsheet.last_edited
        
        import time
        time.sleep(0.1)
        
        flowsheet.name = 'Updated Flowsheet'
        flowsheet.save()
        
        self.assertGreater(flowsheet.last_edited, original_last_edited)

    def test_project_last_edited_updates_on_flowsheet_save(self):
        """Test project last_edited updates when flowsheet is saved"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        
        original_last_edited = project.last_edited
        
        import time
        time.sleep(0.1)
        
        url = f'/flowsheets/{project.id}'
        payload = {
            'name': 'New Flowsheet',
            'description': 'Test',
            'footprint': 'none'
        }
        
        response = self.client.post(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project.refresh_from_db()
        self.assertGreater(project.last_edited, original_last_edited)

    def test_flowsheet_default_preview_url(self):
        """Test flowsheet has default preview URL"""
        from flowsheet_app.models import DEFAULT_PREVIEW_URL
        
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=project
        )
        
        self.assertEqual(flowsheet.background_preview_url, DEFAULT_PREVIEW_URL)

    def test_project_serializer_preview_url_from_latest_flowsheet(self):
        """Test project serializer gets preview URL from latest flowsheet"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        
        Flowsheet.objects.create(
            name='Old Flowsheet',
            description='Test',
            project=project,
            preview_url='http://old.com/preview.png'
        )
        
        import time
        time.sleep(0.1)
        
        latest = Flowsheet.objects.create(
            name='Latest Flowsheet',
            description='Test',
            project=project,
            preview_url='http://latest.com/preview.png'
        )
        
        url = f'/projects/{project.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['project']['preview_url'],
            'http://latest.com/preview.png'
        )

    def test_shape_unique_name_constraint(self):
        """Test Shape name must be unique"""
        Shape.objects.create(name='Circle')
        
        with self.assertRaises(Exception):
            Shape.objects.create(name='Circle')

    def test_flowsheet_create_view_get_method(self):
        """Test FlowsheetCreateView GET method returns flowsheets"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        
        Flowsheet.objects.create(
            name='Flowsheet 1',
            description='Test',
            project=project
        )
        
        url = f'/flowsheet_create/{project.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('project', response.data)
        self.assertIn('flowsheets', response.data)
        self.assertEqual(response.data['project'], 'Test Project')

    def test_flowsheet_create_view_unauthorized_project(self):
        """Test FlowsheetCreateView denies access to other user's project"""
        other_user = User.objects.create_user(
            email='other@example.com',
            password='test123'
        )
        other_project = Project.objects.create(
            name='Other Project',
            description='Test',
            creator=other_user
        )
        
        url = f'/flowsheet_create/{other_project.id}'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SerializerValidationTests(APITestCase):
    """Test cases for serializer validations"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_flowsheet_auto_save_without_frequency_fails(self):
        """Test flowsheet with AUTO save type requires frequency"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        
        url = f'/flowsheets/{project.id}'
        payload = {
            'name': 'Test Flowsheet',
            'description': 'Test',
            'save_frequency_type': 'AUTO',
            'footprint': 'none'
        }
        
        response = self.client.post(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Save frequency must be set', str(response.data))

    def test_flowsheet_auto_save_low_frequency_fails(self):
        """Test flowsheet auto save frequency must be > 10"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        
        url = f'/flowsheets/{project.id}'
        payload = {
            'name': 'Test Flowsheet',
            'description': 'Test',
            'save_frequency_type': 'AUTO',
            'save_frequency': 5,
            'footprint': 'none'
        }
        
        response = self.client.post(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('greater than 10 seconds', str(response.data))

    def test_flowsheet_manual_save_without_frequency_succeeds(self):
        """Test flowsheet with MANUAL save type doesn't require frequency"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        
        url = f'/flowsheets/{project.id}'
        payload = {
            'name': 'Test Flowsheet',
            'description': 'Test',
            'save_frequency_type': 'MANUAL',
            'footprint': 'none'
        }
        
        response = self.client.post(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class IntegrationTests(APITestCase):
    """Integration tests for complete workflows"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_complete_project_workflow(self):
        """Test complete workflow: create project, flowsheet, and objects"""
        project_payload = {
            'name': 'Mining Operation',
            'description': 'Complete mining flowsheet'
        }
        project_response = self.client.post('/projects/', project_payload)
        self.assertEqual(project_response.status_code, status.HTTP_201_CREATED)
        project_id = project_response.data['id']
        
        flowsheet_payload = {
            'name': 'Primary Crushing',
            'description': 'Primary crushing circuit',
            'footprint': 'none'
        }
        flowsheet_response = self.client.post(
            f'/flowsheets/{project_id}',
            flowsheet_payload
        )
        self.assertEqual(flowsheet_response.status_code, status.HTTP_201_CREATED)
        flowsheet_id = flowsheet_response.data['id']
        
        crusher = Crusher.objects.create(
            name='Jaw Crusher',
            image_url='http://example.com/crusher.png',
            creator=self.user
        )
        
        screener = Screener.objects.create(
            name='Vibrating Screen',
            image_url='http://example.com/screen.png',
            creator=self.user
        )
        
        objects_payload = [
            {
                'object_info': str({
                    'object_model_name': 'Crusher',
                    'object_id': str(crusher.id)
                }),
                'label': 'Primary Crusher',
                'x_coordinate': 100.0,
                'y_coordinate': 200.0,
                'scale': {"x": 1.0, "y": 1.0},
                'font_size': 12.0
            },
            {
                'object_info': str({
                    'object_model_name': 'Screener',
                    'object_id': str(screener.id)
                }),
                'label': 'Screen 1',
                'x_coordinate': 300.0,
                'y_coordinate': 200.0,
                'scale': {"x": 1.0, "y": 1.0},
                'font_size': 12.0
            }
        ]
        
        objects_response = self.client.post(
            f'/flowsheet_objects/{flowsheet_id}',
            objects_payload,
            format='json'
        )
        self.assertEqual(objects_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(objects_response.data), 2)
        
        project_detail_response = self.client.get(f'/projects/{project_id}')
        self.assertEqual(project_detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(project_detail_response.data['flowsheets']), 1)
        
        objects_list_response = self.client.get(f'/flowsheet_objects/{flowsheet_id}')
        self.assertEqual(objects_list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(objects_list_response.data), 2)

    def test_copy_flowsheet_workflow(self):
        """Test copying a flowsheet to create a new one"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        
        original = Flowsheet.objects.create(
            name='Original Flowsheet',
            description='Test',
            project=project,
            preview_url='http://example.com/preview.png'
        )
        
        shape = Shape.objects.create(name='Circle')
        from django.contrib.contenttypes.models import ContentType
        content_type = ContentType.objects.get_for_model(Shape)
        
        FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shape.id,
            label='Original Object',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=original
        )
        
        payload = {
            'name': 'Copied Flowsheet',
            'description': 'Copied from original',
            'footprint': str(original.id)
        }
        
        response = self.client.post(f'/flowsheets/{project.id}', payload)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        copied = Flowsheet.objects.get(name='Copied Flowsheet')
        self.assertEqual(copied.flowsheet_objects.count(), 1)
        self.assertEqual(copied.preview_url, original.preview_url)
        
        copied_obj = copied.flowsheet_objects.first()
        self.assertEqual(copied_obj.label, 'Original Object')

    def test_update_multiple_objects_workflow(self):
        """Test updating multiple flowsheet objects in one request"""
        project = Project.objects.create(
            name='Test Project',
            description='Test',
            creator=self.user
        )
        flowsheet = Flowsheet.objects.create(
            name='Test Flowsheet',
            description='Test',
            project=project
        )
        
        shape1 = Shape.objects.create(name='Circle')
        shape2 = Shape.objects.create(name='Square')
        
        from django.contrib.contenttypes.models import ContentType
        content_type = ContentType.objects.get_for_model(Shape)
        
        obj1 = FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shape1.id,
            label='Object 1',
            x_coordinate=100.0,
            y_coordinate=200.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=flowsheet
        )
        
        obj2 = FlowsheetObject.objects.create(
            content_type=content_type,
            object_id=shape2.id,
            label='Object 2',
            x_coordinate=300.0,
            y_coordinate=400.0,
            scale={"x": 1.0, "y": 1.0},
            font_size=12.0,
            flowsheet=flowsheet
        )
        
        shape3 = Shape.objects.create(name='Triangle')
        
        payload = [
            {
                'id': obj1.id,
                'oid': str(obj1.oid),
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(shape1.id)
                }),
                'label': 'Updated Object 1',
                'x_coordinate': 150.0,
                'y_coordinate': 250.0,
                'scale': {"x": 1.5, "y": 1.5},
                'font_size': 14.0
            },
            {
                'id': obj2.id,
                'oid': str(obj2.oid),
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(shape2.id)
                }),
                'label': 'Updated Object 2',
                'x_coordinate': 350.0,
                'y_coordinate': 450.0,
                'scale': {"x": 2.0, "y": 1.0},
                'font_size': 16.0
            },
            {
                'oid': str(uuid.uuid4()),
                'object_info': str({
                    'object_model_name': 'Shape',
                    'object_id': str(shape3.id)
                }),
                'label': 'New Object 3',
                'x_coordinate': 500.0,
                'y_coordinate': 600.0,
                'scale': {"x": 1.0, "y": 1.0},
                'font_size': 12.0
            }
        ]
        
        response = self.client.put(
            f'/flowsheet_objects/{flowsheet.id}/update',
            payload,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        
        obj1.refresh_from_db()
        self.assertEqual(obj1.label, 'Updated Object 1')
        self.assertEqual(float(obj1.x_coordinate), 150.0)


class AuthenticationIntegrationTests(APITestCase):
    """Integration tests for authentication flows"""

    def setUp(self):
        self.superuser = User.objects.create_superuser(
            email='superuser@example.com',
            password='superusersecurepassword123'
        )
        self.user = User.objects.create_user(
            email='user123@example.com',
            password='userpass123'
        )
        

    def test_complete_registration_and_login_flow(self):
        """Test complete user registration and login"""
        register_payload = {
            'email': 'newuser@example.com',
            'password': 'securepass123'
        }
        register_response = self.client.post('/auth/register/', register_payload)
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        
        login_payload = {
            'email': 'newuser@example.com',
            'password': 'securepass123'
        }
        login_response = self.client.post('/auth/token/', login_payload)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)
        
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {login_response.data["access"]}'
        )
        user_response = self.client.get('/auth/user/')
        self.assertEqual(user_response.status_code, status.HTTP_200_OK)
        self.assertEqual(user_response.data['email'], 'newuser@example.com')
        


    @patch('authentication.views.Thread')
    def test_complete_password_reset_flow(self, mock_thread):
        """Test complete password reset flow"""
        user = User.objects.create_user(
            email='user@example.com',
            password='oldpass123'
        )
        
        request_payload = {
            'email': 'user@example.com',
            'host': 'http://localhost:3000'
        }
        request_response = self.client.post(
            '/auth/request-password-reset/',
            request_payload
        )
        self.assertEqual(request_response.status_code, status.HTTP_200_OK)
        
        user.refresh_from_db()
        token = user.password_reset_token
        self.assertIsNotNone(token)
        
        verify_payload = {'token': token}
        verify_response = self.client.post(
            '/auth/password-reset-verification/',
            verify_payload
        )
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        
        reset_payload = {
            'token': token,
            'email': 'user@example.com',
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        }
        reset_response = self.client.post('/auth/password-reset/', reset_payload)
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)
        
        login_payload = {
            'email': 'user@example.com',
            'password': 'newpass123'
        }
        login_response = self.client.post('/auth/token/', login_payload)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
 

    def test_update_other_user_screener_fails(self):
        """Test updating another user's screener fails"""

        login_payload = {
            'email': 'user123@example.com',
            'password': 'userpass123'
        }
        login_response = self.client.post('/auth/token/', login_payload)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)
        
        self.client.credentials(
            HTTP_AUTHORIZATION=f'Bearer {login_response.data["access"]}'
        )
        other_user = User.objects.create_user(
            email='other@example.com',
            password='test123'
        )
        screener = Screener.objects.create(
            name='Other Screener',
            image_url='http://example.com/image.png',
            creator=other_user
        )
        url = f'/screeners/{screener.id}'
        payload = {'name': 'Hacked Screener'}
        
        response = self.client.patch(url, payload)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        """ not found because
        qs = self.get_queryset() === in our case returns none alraady
        obj = get_object_or_404(qs, pk=...) == throws a not found error
        self.check_object_permissions(request, obj) == doesn't get here 

        hence why we get a 404 instead of forbidden.
        """
        screener.refresh_from_db()
        self.assertNotEqual(screener.name, payload['name'])
        self.assertEqual(screener.name, "Other Screener")

    def test_superuser_can_update_any_screener(self):
        """Test superuser can update any screener"""
        self.client.force_authenticate(user=self.superuser)
        screener = Screener.objects.create(
            name='Test Screener',
            image_url='http://example.com/image.png',
            creator=self.user
        )
        url = f'/screeners/{screener.id}'
        payload = {'name': 'Admin Updated'}
        
        response = self.client.patch(url, payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        screener.refresh_from_db()
        self.assertEqual(screener.name, payload['name'])
