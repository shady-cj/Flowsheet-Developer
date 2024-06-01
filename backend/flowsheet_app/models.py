from django.db import models
from authentication.models import User

# Create your models here.



# For shapes like triangle, square, circle
class Shape(models.Model):
    name = models.CharField(max_length=20)
    image = models.ImageField(null=True, blank=True)


# Screeners
class Screener(models.Model):
    name = models.CharField(max_length=20)
    image = models.ImageField(null=True, blank=True)


# Grinding machines variations
class Grinder(models.Model):
    name = models.CharField(max_length=20)
    image = models.ImageField(null=True, blank=True)


# Concentration Techniques
class Concentrators(models.Model):
    name = models.CharField(max_length=64)
    image = models.ImageField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)


# Miscellaneous like ore, holding facilities etc...
class Miscellaneous(models.Model):
    name = models.CharField(max_length=64)
    image = models.ImageField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)




# Defines each project of the user, that contains multiple object mapper
# This model would be extended overtime as more information arises

class Project(models.Model):
    name = models.CharField(max_length=64)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="products")



class ProjectObject(models.Model):
    # object = ForeignKey() To shapes, grinders, concentrators etc
    x_coordinate = models.DecimalField(max_digits=20, decimal_places=2) # how far is it from the container x-axis
    y_coordinate = models.DecimalField(max_digits=20, decimal_places=2) # how far is it from the container y-axis
    scale = models.DecimalField(max_digits=4, decimal_places=2) # the scale of the object? how big or how small
    font_size = models.DecimalField(max_digits=3, decimal_places=2) # the font size in pixels
    description = models.TextField() # The description of the object Mapper
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_objects")


    # This model would be extended over time.
