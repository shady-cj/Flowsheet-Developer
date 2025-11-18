from .models import Shape, Screener, Crusher, Grinder, Concentrator, Auxilliary, Project
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from .models import FlowsheetObject
from PIL import Image, ImageStat
import math
from io import BytesIO
from .removebg import remove_bg
from cloudinary.uploader import upload
import base64


# =================================
# Defining a simple `get_queryset_util` function that would be used for filtering the get_queryset for each api view for Screener, Crusher,Grinder, Concentrator, Auxilliary


def get_queryset_util(self, obj_class):
    user = self.request.user
    if user.is_superuser:
        return obj_class.objects.all()
    return obj_class.objects.filter(
        Q(creator=user) | Q(creator__is_superuser=True)
    ).distinct()


# ==================================


def object_formatter(obj):
    image_url = getattr(obj, "image_url", None)
    default = {
        "id": obj.id,
        "name": obj.name,
        "image_url": image_url,
        "image_width": obj.image_width if image_url else None,
        "image_height": obj.image_height if image_url else None,
        "model_name": obj.__class__.__name__,
    }
    # if isinstance(obj, Crusher) or isinstance(obj, Grinder):
    #     default.update({
    #         "type": obj.type,
    #         "gape": obj.gape,
    #         # "set": obj.set
    #     })

    if isinstance(obj, Concentrator):
        default.update(
            {
                "description": obj.description,
                "gangue_recoverable": obj.gangue_recoverable,
                "valuable_recoverable": obj.valuable_recoverable,
            }
        )
    elif isinstance(obj, Auxilliary):
        default.update({"type": obj.type, "description": obj.description})
    elif isinstance(obj, Shape):
        default.pop("image_url")
        default.pop("image_height")
        default.pop("image_width")

    return default


EXPECTED_OBJECT_NAMES = (
    "Shape",
    "Crusher",
    "Screener",
    "Grinder",
    "Concentrator",
    "Auxilliary",
)


def create_object_util(self, index, data):
    data = data[index] if index is not None else data
    object_info = eval(data.get("object_info"))
    object_name = object_info.get(
        "object_model_name"
    )  # object_model expected values ("Shape", "Crusher", "Screener", "Grinder", "Concentrator", "Auxilliary")
    object_model_id = object_info.get(
        "object_id"
    )  # The id of the object being referenced (Shape, Crusher, Screener, Grinder, Concentrator Auxilliary)
    if object_name not in EXPECTED_OBJECT_NAMES:
        raise serializers.ValidationError(
            {"object_model_name": "Invalid object project name provided"}
        )
    object_model = eval(object_name)
    try:
        object_instance = object_model.objects.get(id=object_model_id)
    except object_model.DoesNotExist:
        raise serializers.ValidationError(
            {"object_id": "Given id is not associated to any object in the database"}
        )
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
        return FlowsheetObject.objects.get(id=id).object

    # else we create the project Object
    object_info = eval(data.get("object_info"))
    object_name = object_info.get(
        "object_model_name"
    )  # object_model expected values ("Shape", "Crusher", "Screener", "Grinder", "Concentrator", "Auxilliary")
    object_model_id = object_info.get(
        "object_id"
    )  # The id of the object being referenced (Shape, Crusher, Screener, Grinder, Concentrator Auxilliary)
    if object_name not in EXPECTED_OBJECT_NAMES:
        raise serializers.ValidationError(
            {"object_model_name": "Invalid object project name provided"}
        )
    object_model = eval(object_name)
    object_instance = object_model.objects.get(id=object_model_id)
    if not object_instance:
        raise serializers.ValidationError(
            {"object_id": "Given id is not associated to any object in the database"}
        )
    # quick check if the current user has access to the object
    user = self.request.user
    if hasattr(object_instance, "creator"):
        if object_instance.creator == user or object_instance.creator.is_superuser:
            pass
        else:
            raise PermissionDenied("You are not authorized to use this object")
    return object_instance


def destroy_object_util(object_id, object_type, user):
    if object_type not in EXPECTED_OBJECT_NAMES:
        raise serializers.ValidationError(
            {"message": "Invalid object project name provided"}
        )
    object_model = eval(object_type)
    if not hasattr(object_model, "creator"):
        raise PermissionDenied("You are not authorized to delete this object")
    try:
        obj = object_model.objects.get(id=object_id, creator=user)
        obj.delete()

    except object_model.DoesNotExist:
        raise serializers.ValidationError(
            {"message": f"No object of such was created by this user"}
        )

    # return {"message": f"object ({obj.name}) successfully deleted", "success": True}




def is_transparent_background(img, border_width=1, alpha_threshold=80, ratio_threshold=0.8):
    """
        Detects if image edges are mostly transparent.
        percent = fraction of border pixels that must be transparent (0.8 = 80%)
    """
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    alpha = img.getchannel("A")
    w, h = img.size

    # Define each border as its own region
    borders = [
        alpha.crop((0, 0, w, border_width)),        # top
        alpha.crop((0, h-border_width, w, h)),      # bottom
        alpha.crop((0, 0, border_width, h)),        # left
        alpha.crop((w-border_width, 0, w, h))       # right
    ]

    for border in borders:
        pixels = border.getdata()
        total = len(pixels)

        transparent_count = sum(1 for p in pixels if p <= alpha_threshold)
        ratio = transparent_count / total
        # If any border is mostly transparent, return True
        if ratio >= ratio_threshold:
            return True

    return False

def process_component_image(data):
    image = data["image"]

    if not image:
        return None

    input = Image.open(image).convert("RGBA")
    # print("input", input.format, input.mode, input.filename)
    # Fix: Convert palette images to RGBA so Pillow stops warning
    # if input.mode == "P":
    #     input = input.convert("RGBA")

    # if input.format != "PNG" or input.mode != "RGBA":
    #     input = remove(input)
    if not is_transparent_background(input):
        input = remove_bg(input)
    input.thumbnail((100, 100))
      


    # enhanced_img = ImageEnhance.Brightness(input)
    data["image_width"], data["image_height"] = input.size
    imageBuffer = BytesIO()
    input.save(imageBuffer, format="PNG", optimize=True)
    imageBuffer.seek(0)
    upload_result = upload(
        imageBuffer.getvalue(), folder=data["folder"], resource_type="image"
    )
    data["image_url"] = upload_result["secure_url"]
    return data


def upload_preview_image(image, flowsheet_id):
    if not image:
        return None
    encoded_data = "".join(image.split(",")[1:])
    decoded_data = base64.b64decode(encoded_data)

    # imageBuffer = BytesIO(decoded_data)
    # input = Image.open(imageBuffer)
    # input.save("test_file.png")

    upload_result = upload(
        decoded_data, folder=f"{flowsheet_id}_previews", resource_type="image"
    )
    return upload_result["secure_url"]


def upload_images_default(images, feedback_id):

    if not len(images):
        return None

    image_urls = []
    for image in images:

        input = Image.open(image)
        # input.thumbnail((300, 300))
        imageBuffer = BytesIO()
        input.save(imageBuffer, format=input.format, optimize=True)
        imageBuffer.seek(0)
        upload_result = upload(
            imageBuffer.getvalue(),
            folder=f"feedback_images_{feedback_id}",
            resource_type="image",
        )
        image_urls.append(upload_result["secure_url"])

    return None if len(image_urls) == 0 else image_urls
