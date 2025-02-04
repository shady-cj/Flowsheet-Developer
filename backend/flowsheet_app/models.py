from django.db import models
from authentication.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
import uuid
import unicodedata
from cloudinary.models import CloudinaryField
from django.utils.timesince import timesince

# Create your models here.


# For shapes like triangle, square, circle
class Shape(models.Model):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=20, unique=True)


# Screeners
class Screener(models.Model):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=20)
    image_url = models.URLField()
    image_width = models.IntegerField(default=60)
    image_height = models.IntegerField(default=60)
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="screeners", null=True, blank=True
    )


# #
#     def save(self, *args, **kwargs):
#         print(self.test, "test")


class Crusher(models.Model):
    # CRUSHER_TYPES = (
    #     ("PRIMARY", "Primary"),
    #     ("SECONDARY", "Secondary"),
    #     ("TERTIARY", "Tertiary")

    # )
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=20)
    image_url = models.URLField()
    image_width = models.IntegerField(default=60)
    image_height = models.IntegerField(default=60)
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="crushers", null=True, blank=True
    )


# Grinding machines variations
class Grinder(models.Model):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=20)
    image_url = models.URLField()
    # image = CloudinaryField('image', folder="grinders", transformation=[{"raw_transformation":"w_50,c_fit"}])

    # gape = models.DecimalField(max_digits=10,decimal_places=2, default=20.00) # size of the feed opening, basically size of ore expected must be 0.80 times this value, this value is expected to be fixed since most times we can't adjust the gape
    # # NOTE in grinding some milling machines don't have standard calibration for measuring gape size and set size (e.g ball mills and some other milling machines like it) in that case we just assume values for the gape and set (expected size of materials going in and expected size of materials coming out)
    image_width = models.IntegerField(default=60)
    image_height = models.IntegerField(default=60)
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="grinders", null=True, blank=True
    )


# Both grinder and crusher would be extended in the future to factor in the probability of achieving the desired size


# Concentration Techniques
class Concentrator(models.Model):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=64)
    image_url = models.URLField()
    # image = CloudinaryField('image', folder="concentrators", transformation=[{"raw_transformation":"w_60,c_fit"}])
    image_width = models.IntegerField(default=60)
    image_height = models.IntegerField(default=60)
    description = models.TextField(null=True, blank=True)
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="concentrators",
        null=True,
        blank=True,
    )
    # recovery criteria
    valuable_recoverable = models.DecimalField(
        max_digits=4, decimal_places=1, default=20.0
    )
    gangue_recoverable = models.DecimalField(
        max_digits=4, decimal_places=1, default=20.0
    )
    # recovery_rate = models.DecimalField(max_digits=10, decimal_places=4) # amount of valuable mineral in the concentrate / total amount of valuable mineral in the feed
    # dilution_gain = models.DecimalField(max_digits=10, decimal_places=4) # amount of waste in the concentrate / toatal amount of concentrate


# Miscellaneous like ore, holding facilities etc...
class Auxilliary(models.Model):
    MISC_TYPE = {
        "ORE": "ore",
        "Storage Facility": {"STOCKPILE": "stockpile", "BINS": "bins"},
        "TAILING FACILITY": "tailing facility",
        "OTHERS": "others",
    }
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=64)
    image_url = models.URLField()
    # image = CloudinaryField('image', folder="auxilliary", transformation=[{"raw_transformation":"w_50,c_fit"}])
    image_width = models.IntegerField(default=60)
    image_height = models.IntegerField(default=60)
    description = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=40, choices=MISC_TYPE, default="ORE")
    creator = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="misc", null=True, blank=True
    )

    class Meta:
        verbose_name_plural = "Auxilliaries"


# A project can contain multiple flowsheets


class Project(models.Model):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=64)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    starred = models.BooleanField(default=False)
    last_edited = models.DateTimeField(auto_now=True)

    def get_mins_ago(self):
        ago = unicodedata.normalize("NFKD", timesince(self.last_edited, timezone.now()))
        ago = ago.split(", ")[0]
        return "now" if ago == "0 minutes" else ago


# Defines each flowsheet for a project, that contains multiple object mapper
# This model would be extended overtime as more information arises


class Flowsheet(models.Model):
    id = models.UUIDField(
        primary_key=True, unique=True, default=uuid.uuid4, editable=False
    )
    name = models.CharField(max_length=64)
    description = models.TextField()
    preview_url = models.URLField(
        default="https://res.cloudinary.com/dpykexpss/image/upload/v1737482485/grid_je7dz4.png"
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="flowsheets"
    )
    last_edited = models.DateTimeField(auto_now=True)
    starred = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ---- project/{self.project.id}/flowsheet/{self.id}"

    def get_mins_ago(self):
        ago = unicodedata.normalize("NFKD", timesince(self.last_edited, timezone.now()))
        ago = ago.split(", ")[0]
        return "now" if ago == "0 minutes" else ago


class FlowsheetObject(models.Model):
    content_type = models.ForeignKey(
        ContentType, on_delete=models.CASCADE, null=True, blank=True
    )
    object_id = models.UUIDField(null=True, blank=True)
    # object_id = models.PositiveIntegerField(null=True, blank=True)
    oid = models.UUIDField(default=uuid.uuid4, unique=True)
    label = models.CharField(max_length=64)
    object = GenericForeignKey(
        "content_type", "object_id"
    )  # foreign key To shapes, grinders, concentrators etc
    x_coordinate = models.DecimalField(
        max_digits=12, decimal_places=6
    )  # how far is it from the container x-axis
    y_coordinate = models.DecimalField(
        max_digits=12, decimal_places=6
    )  # how far is it from the container y-axis
    scale = models.DecimalField(
        max_digits=5, decimal_places=2
    )  # the scale of the object? how big or how small
    font_size = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # the font size in pixels
    description = models.TextField(
        blank=True, null=True
    )  # The description of the object Mapper
    flowsheet = models.ForeignKey(
        Flowsheet,
        on_delete=models.CASCADE,
        related_name="flowsheet_objects",
        blank=True,
    )
    properties = models.JSONField(blank=True, null=True)  # property of the objects

    # This model would be extended over time.
