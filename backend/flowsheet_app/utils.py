from .models import Shape, Screener, Crusher, Grinder, Concentrator, Auxilliary, Project
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from .models import ProjectObject
from PIL import Image
from io import BytesIO
from rembg import remove
from cloudinary.uploader import upload


# =================================
# Defining a simple `get_queryset_util` function that would be used for filtering the get_queryset for each api view for Screener, Crusher,Grinder, Concentrator, Auxilliary

def get_queryset_util(self, obj_class):
    user = self.request.user
    if user.is_superuser:
        return obj_class.objects.all()
    return obj_class.objects.filter(Q(creator = user) | Q(creator__is_superuser = True)).distinct()

# ==================================


def object_formatter(obj):
    image_url = getattr(obj, "image_url", None)
    default = {
        "id": obj.id,
        "name": obj.name,
        "image_url": image_url, 
        "model_name": obj.__class__.__name__
    }
    # if isinstance(obj, Crusher) or isinstance(obj, Grinder):
    #     default.update({
    #         "type": obj.type,
    #         "gape": obj.gape,
    #         # "set": obj.set
    #     })

    if isinstance(obj, Concentrator):
        default.update({
            "description": obj.description,
        })
    elif isinstance(obj, Auxilliary):
        default.update({
            "type": obj.type,
            "description": obj.description
        })
    elif isinstance(obj, Shape):
        default.pop("image_url")

    return default



EXPECTED_OBJECT_NAMES = ("Shape", "Crusher", "Screener", "Grinder", "Concentrator", "Auxilliary")
def create_object_util(self, index, data):
    data = data[index] if index is not None else data
    object_info = eval(data.get("object_info"))
    object_name = object_info.get("object_model_name") # object_model expected values ("Shape", "Crusher", "Screener", "Grinder", "Concentrator", "Auxilliary")
    object_model_id = object_info.get("object_id") # The id of the object being referenced (Shape, Crusher, Screener, Grinder, Concentrator Auxilliary)
    if object_name not in EXPECTED_OBJECT_NAMES:
        raise serializers.ValidationError({"object_model_name": "Invalid object project name provided"})
    object_model = eval(object_name)
    object_instance = object_model.objects.get(id=object_model_id)
    if not object_instance:
        raise serializers.ValidationError({"object_id": "Given id is not associated to any object in the database"})
    # quick check if the current user has access to the object
    user = self.request.user
    if hasattr(object_instance, "creator"):
        if object_instance.creator == user or object_instance.creator.is_superuser:
            pass
        else:
            raise PermissionDenied("You are not authorized to use this object")
    return object_instance


def update_object_util(self, index, data):
    data = data[index] if index is not None else data
    # check if the current entry is already created
    if "id" in data:
        # if it has an id then it's already created in the database
        # we might not need to make this additional query.
        id = data.get("id")
        return ProjectObject.objects.get(id=id).object


    # else we create the project Object
    object_info = eval(data.get("object_info"))
    object_name = object_info.get("object_model_name") # object_model expected values ("Shape", "Crusher", "Screener", "Grinder", "Concentrator", "Auxilliary")
    object_model_id = object_info.get("object_id") # The id of the object being referenced (Shape, Crusher, Screener, Grinder, Concentrator Auxilliary)
    if object_name not in EXPECTED_OBJECT_NAMES:
        raise serializers.ValidationError({"object_model_name": "Invalid object project name provided"})
    object_model = eval(object_name)
    object_instance = object_model.objects.get(id=object_model_id)
    if not object_instance:
        raise serializers.ValidationError({"object_id": "Given id is not associated to any object in the database"})
    # quick check if the current user has access to the object
    user = self.request.user
    if hasattr(object_instance, "creator"):
        if object_instance.creator == user or object_instance.creator.is_superuser:
            pass
        else:
            raise PermissionDenied("You are not authorized to use this object")
    return object_instance





def process_component_image(data):
    image = data['image']
   
    if not image:
        return None
    input = Image.open(image)
    input.thumbnail((60, 60))
    output = remove(input)
    data["image_width"], data["image_height"] = output.size
    imageBuffer = BytesIO()
    output.save(imageBuffer, format="PNG")
    imageBuffer.seek(0)
    upload_result = upload(
        imageBuffer.getvalue(), 
        folder=data["folder"], 
        resource_type="image"
    )
    data["image_url"] = upload_result['secure_url']
    return data
    