from django.contrib import admin
from .models import Shape, Concentrator, Grinder, Crusher, Auxilliary, Project, ProjectObject, Screener

# Register your models here.

admin.site.register(Shape)
admin.site.register(Concentrator)
admin.site.register(Grinder)
admin.site.register(Crusher)
admin.site.register(Auxilliary)
admin.site.register(Project)
admin.site.register(ProjectObject)
admin.site.register(Screener)


