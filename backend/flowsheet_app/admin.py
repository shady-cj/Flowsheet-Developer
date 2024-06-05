from django.contrib import admin
from .models import Shape, Concentrator, Grinder, Crusher, Miscellaneous, Project, ProjectObject

# Register your models here.

admin.site.register(Shape)
admin.site.register(Concentrator)
admin.site.register(Grinder)
admin.site.register(Crusher)
admin.site.register(Miscellaneous)
admin.site.register(Project)
admin.site.register(ProjectObject)


