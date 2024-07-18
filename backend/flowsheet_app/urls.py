from django.urls import path
from .views import ListCreateShapes, ListCreateScreener, RetrieveUpdateDestroyScreener, ListCreateCrusher, RetrieveUpdateDestroyCrusher, ListCreateGrinder, RetrieveUpdateDestroyGrinder, ListCreateConcentrator, RetrieveUpdateDestroyConcentrator, ListCreateAuxilliary, RetrieveUpdateDestroyAuxilliary, ListCreateProject, RetrieveUpdateDestroyProject, ListCreateProjectObject, RetrieveUpdateDestroyProjectObject

urlpatterns = [
        path("shapes/", ListCreateShapes.as_view()),
        path("screeners/", ListCreateScreener.as_view()),
        path("screeners/<str:id>", RetrieveUpdateDestroyScreener.as_view()), 
        path("crushers", ListCreateCrusher.as_view()),
        path("crushers/<str:id>", RetrieveUpdateDestroyCrusher.as_view()),
        path("grinders", ListCreateGrinder.as_view()),
        path("grinders/<str:id>", RetrieveUpdateDestroyGrinder.as_view()),
        path("concentrators", ListCreateConcentrator.as_view()),
        path("concentrators/<str:id>", RetrieveUpdateDestroyConcentrator.as_view()),
        path("auxilliary", ListCreateAuxilliary.as_view()),
        path("auxilliary/<str:id>", RetrieveUpdateDestroyAuxilliary.as_view()),
        path("projects/", ListCreateProject.as_view()), 
        path("projects/<int:id>", RetrieveUpdateDestroyProject.as_view()),
        path("project_objects/<str:project_id>", ListCreateProjectObject.as_view()),
        path("project_object/<str:project_id>/<int:id>", RetrieveUpdateDestroyProjectObject.as_view())
    ]

