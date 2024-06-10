from django.urls import path
from .views import ListCreateShapes, ListCreateScreener, RetrieveUpdateDestroyScreener, ListCreateCrusher, RetrieveUpdateDestroyCrusher, ListCreateGrinder, RetrieveUpdateDestroyGrinder, ListCreateConcentrator, RetrieveUpdateDestroyConcentrator, ListCreateMiscellaneous, RetrieveUpdateDestroyMiscellaneous, ListCreateProject, RetrieveUpdateDestroyProject, ListCreateProjectObject, RetrieveUpdateDestroyProjectObject

urlpatterns = [
        path("shapes/", ListCreateShapes.as_view()),
        path("screeners/", ListCreateScreener.as_view()),
        path("screeners/<int:id>", RetrieveUpdateDestroyScreener.as_view()), 
        path("crushers", ListCreateCrusher.as_view()),
        path("crushers/<int:id>", RetrieveUpdateDestroyCrusher.as_view()),
        path("grinders", ListCreateGrinder.as_view()),
        path("grinders/<int:id>", RetrieveUpdateDestroyGrinder.as_view()),
        path("concentrators", ListCreateConcentrator.as_view()),
        path("concentrators/<int:id>", RetrieveUpdateDestroyConcentrator.as_view()),
        path("miscellaneous", ListCreateMiscellaneous.as_view()),
        path("miscellaneous/<int:id>", RetrieveUpdateDestroyMiscellaneous.as_view()),
        path("projects/", ListCreateProject.as_view()), 
        path("projects/<int:id>", RetrieveUpdateDestroyProject.as_view()),
        path("project_objects/<int:project_id>", ListCreateProjectObject.as_view()),
        path("project_object/<int:project_id>/<int:id>", RetrieveUpdateDestroyProjectObject.as_view())
    ]