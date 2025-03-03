from django.urls import path
from .views import (
    ListCreateShapes,
    ListCreateScreener,
    RetrieveUpdateDestroyScreener,
    ListCreateCrusher,
    RetrieveUpdateDestroyCrusher,
    ListCreateGrinder,
    RetrieveUpdateDestroyGrinder,
    ListCreateConcentrator,
    RetrieveUpdateDestroyConcentrator,
    ListCreateAuxilliary,
    RetrieveUpdateDestroyAuxilliary,
    ListCreateProject,
    RetrieveUpdateDestroyProject,
    ListCreateFlowsheetObject,
    UpdateDestroyFlowsheetObject,
    FlowsheetCreateView,
    ListFlowsheet,
    ListCreateFlowsheet,
    RetrieveUpdateDestroyFlowsheet,
    UpdateFlowsheetPreview,
)

urlpatterns = [
    path("shapes/", ListCreateShapes.as_view()),
    path("screeners/", ListCreateScreener.as_view()),
    path("screeners/<str:id>", RetrieveUpdateDestroyScreener.as_view()),
    path("crushers/", ListCreateCrusher.as_view()),
    path("crushers/<str:id>", RetrieveUpdateDestroyCrusher.as_view()),
    path("grinders/", ListCreateGrinder.as_view()),
    path("grinders/<str:id>", RetrieveUpdateDestroyGrinder.as_view()),
    path("concentrators/", ListCreateConcentrator.as_view()),
    path("concentrators/<str:id>", RetrieveUpdateDestroyConcentrator.as_view()),
    path("auxilliary/", ListCreateAuxilliary.as_view()),
    path("auxilliary/<str:id>", RetrieveUpdateDestroyAuxilliary.as_view()),
    path("flowsheets/", ListFlowsheet.as_view()),
    path("flowsheets/<str:project_id>", ListCreateFlowsheet.as_view()),
    path(
        "flowsheets/<str:flowsheet_id>/update_preview", UpdateFlowsheetPreview.as_view()
    ),
    path(
        "flowsheets/<str:project_id>/update/<str:flowsheet_id>",
        RetrieveUpdateDestroyFlowsheet.as_view(),
    ),
    path("flowsheet_create/<str:project_id>", FlowsheetCreateView.as_view()),
    path("projects/", ListCreateProject.as_view()),
    path("projects/<str:id>", RetrieveUpdateDestroyProject.as_view()),
    path("flowsheet_objects/<str:flowsheet_id>", ListCreateFlowsheetObject.as_view()),
    path(
        "flowsheet_objects/<str:flowsheet_id>/update",
        UpdateDestroyFlowsheetObject.as_view(),
    ),
]
