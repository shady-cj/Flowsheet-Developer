from django.db import models
from authentication.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid
# Create your models here.



# For shapes like triangle, square, circle
class Shape(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20, unique=True)


# Screeners
class Screener(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20)
    image = models.ImageField(null=True, blank=True)
    # mesh_size = models.DecimalField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="screeners", null=True, blank=True)

class Crusher(models.Model):
    CRUSHER_TYPES = (
        ("PRIMARY", "Primary"),
        ("SECONDARY", "Secondary"),
        ("TERTIARY", "Tertiary")

    )
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20)
    image = models.ImageField(null=True, blank=True)
    type = models.CharField(max_length=30, choices=CRUSHER_TYPES, default="PRIMARY")
    gape = models.DecimalField(max_digits=10,decimal_places=2, default=100.00) # size of the feed opening, basically size of expected must be 0.85 times this value
    set = models.DecimalField(max_digits=10, decimal_places=2, default=30.00) # size of the machine outlet (product outlet or reduced size)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="crushers", null=True, blank=True)

# Grinding machines variations
class Grinder(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20)
    image = models.ImageField(null=True, blank=True)
    gape = models.DecimalField(max_digits=10,decimal_places=2, default=20.00) # size of the feed opening, basically size of ore expected must be 0.80 times this value, this value is expected to be fixed since most times we can't adjust the gape
    # NOTE in grinding some milling machines don't have standard calibration for measuring gape size and set size (e.g ball mills and some other milling machines like it) in that case we just assume values for the gape and set (expected size of materials going in and expected size of materials coming out)

    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="grinders", null=True, blank=True)

# Both grinder and crusher would be extended in the future to factor in the probability of achieving the desired size


# Concentration Techniques
class Concentrator(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=64)
    image = models.ImageField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="concentrators", null=True, blank=True)
    recovery_rate = models.DecimalField(max_digits=10, decimal_places=4) # amount of valuable mineral in the concentrate / total amount of valuable mineral in the feed
    dilution_gain = models.DecimalField(max_digits=10, decimal_places=4) # amount of waste in the concentrate / toatal amount of concentrate


# Miscellaneous like ore, holding facilities etc...
class Auxilliary(models.Model):
    MISC_TYPE = {
        "ORE": "ore", 
        "Facility": {
            "STOCKPILE": "stockpile",
            "BINS": "bins"
        }
    }
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=64)
    image = models.ImageField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=40, choices=MISC_TYPE, default="ORE")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="misc", null=True, blank=True)
    

    class Meta:
        verbose_name_plural = "Auxilliaries"




# Defines each project of the user, that contains multiple object mapper
# This model would be extended overtime as more information arises

class Project(models.Model):
    id = models.UUIDField(primary_key=True, unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=64)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")



class ProjectObject(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.UUIDField(null=True, blank=True)
    # object_id = models.PositiveIntegerField(null=True, blank=True)
    oid = models.UUIDField(default=uuid.uuid4, unique=True)
    label = models.CharField(max_length=64)
    object = GenericForeignKey('content_type', 'object_id') # foreign key To shapes, grinders, concentrators etc
    x_coordinate = models.DecimalField(max_digits=10, decimal_places=4) # how far is it from the container x-axis
    y_coordinate = models.DecimalField(max_digits=10, decimal_places=4) # how far is it from the container y-axis
    scale = models.DecimalField(max_digits=5, decimal_places=2) # the scale of the object? how big or how small
    font_size = models.DecimalField(max_digits=10, decimal_places=2) # the font size in pixels
    description = models.TextField(blank=True, null=True) # The description of the object Mapper
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_objects")
    properties = models.JSONField(blank=True, null=True) # property of the objects


    # This model would be extended over time.
