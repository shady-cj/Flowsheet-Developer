from django.db import models
from authentication.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# Create your models here.



# For shapes like triangle, square, circle
class Shape(models.Model):
    name = models.CharField(max_length=20)
    oid = models.UUIDField(blank=True, null=True, unique=True)
    image = models.ImageField(null=True, blank=True)


# Screeners
class Screener(models.Model):
    name = models.CharField(max_length=20)
    oid = models.UUIDField(blank=True, null=True, unique=True)
    image = models.ImageField(null=True, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="screeners", null=True, blank=True)

class Crusher(models.Model):
    CRUSHER_TYPES = (
        ("PRIMARY", "Primary"),
        ("SECONDARY", "Secondary"),
        ("TERTIARY", "Tertiary")

    )
    name = models.CharField(max_length=20)
    oid = models.UUIDField(blank=True, null=True)
    image = models.ImageField(null=True, blank=True)
    type = models.CharField(max_length=30, choices=CRUSHER_TYPES, default="PRIMARY")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="crushers", null=True, blank=True)

# Grinding machines variations
class Grinder(models.Model):
    name = models.CharField(max_length=20)
    oid = models.UUIDField(blank=True, null=True, unique=True)
    image = models.ImageField(null=True, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="grinders", null=True, blank=True)


# Concentration Techniques
class Concentrator(models.Model):
    name = models.CharField(max_length=64)
    oid = models.UUIDField(blank=True, null=True, unique=True)
    image = models.ImageField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="concentrators", null=True, blank=True)
    recovery_rate = models.DecimalField(max_digits=4, decimal_places=4) # amount of valuable mineral in the concentrate / total amount of valuable mineral in the feed
    dilution_gain = models.DecimalField(max_digits=4, decimal_places=4) # amount of waste in the concentrate / toatal amount of concentrate


# Miscellaneous like ore, holding facilities etc...
class Miscellaneous(models.Model):
    MISC_TYPE = {
        "ORE": "ore", 
        "Facility": {
            "STOCKPILE": "stockpile",
            "BINS": "bins"
        }
    }
    
    name = models.CharField(max_length=64)
    oid = models.UUIDField(blank=True, null=True, unique=True)
    image = models.ImageField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=40, choices=MISC_TYPE, default="ORE")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="misc", null=True, blank=True)
    

    class Meta:
        verbose_name_plural = "Miscellaneous"




# Defines each project of the user, that contains multiple object mapper
# This model would be extended overtime as more information arises

class Project(models.Model):
    name = models.CharField(max_length=64)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")



class ProjectObject(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    object = GenericForeignKey('content_type', 'object_id') # foreign key To shapes, grinders, concentrators etc
    x_coordinate = models.DecimalField(max_digits=20, decimal_places=2) # how far is it from the container x-axis
    y_coordinate = models.DecimalField(max_digits=20, decimal_places=2) # how far is it from the container y-axis
    scale = models.DecimalField(max_digits=4, decimal_places=2) # the scale of the object? how big or how small
    font_size = models.DecimalField(max_digits=3, decimal_places=2) # the font size in pixels
    description = models.TextField() # The description of the object Mapper
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_objects")
    properties = models.JSONField(blank=True, null=True) # property of the objects


    # This model would be extended over time.
