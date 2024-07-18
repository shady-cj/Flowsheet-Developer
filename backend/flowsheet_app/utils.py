from .models import Shape, Screener, Crusher, Grinder, Concentrator, Auxilliary, Project
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied



# =================================
# Defining a simple `get_queryset_util` function that would be used for filtering the get_queryset for each api view for Screener, Crusher,Grinder, Concentrator, Auxilliary

def get_queryset_util(self, obj_class):
    user = self.request.user
    if user.is_superuser:
        return obj_class.objects.all()
    return obj_class.objects.filter(Q(creator = user) | Q(creator__is_superuser = True)).distinct()

# ==================================


def object_formatter(obj):
    default = {
        "id": obj.id,
        "name": obj.name,
        "image": obj.image or None
    }
    if isinstance(obj, Crusher) or isinstance(obj, Grinder):
        default.update({
            "type": obj.type,
            "gape": obj.gape,
            # "set": obj.set
        })
    
    elif isinstance(obj, Concentrator):
        default.update({
            "recovery_rate": obj.recovery_rate,
            "dilution_gain": obj.dilution_gain
        })
    elif isinstance(obj, Auxilliary):
        default.update({
            "type": obj.type
        })
    return default



EXPECTED_OBJECT_NAMES = ("Shape", "Crusher", "Screener", "Grinder", "Concentrator", "Auxilliary")
def perform_create_update_util(self, index, data):
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