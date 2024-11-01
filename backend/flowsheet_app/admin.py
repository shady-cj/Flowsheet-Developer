from django.contrib import admin
from .models import Shape, Concentrator, Grinder, Crusher, Auxilliary, Project, FlowsheetObject, Flowsheet, Screener

# Register your models here.

admin.site.register(Shape)
admin.site.register(Concentrator)
admin.site.register(Grinder)
admin.site.register(Crusher)
admin.site.register(Auxilliary)
admin.site.register(Project)
admin.site.register(FlowsheetObject)
admin.site.register(Flowsheet)
admin.site.register(Screener)


