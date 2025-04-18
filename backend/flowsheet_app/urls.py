from django.urls import path
from .views import (
    ListCreateShapes,
    ListCreateScreener,
    RetrieveUpdateScreener,
    ListCreateCrusher,
    RetrieveUpdateCrusher,
    ListCreateGrinder,
    RetrieveUpdateGrinder,
    ListCreateConcentrator,
    RetrieveUpdateConcentrator,
    ListCreateAuxilliary,
    RetrieveUpdateAuxilliary,
    ListCreateProject,
    RetrieveUpdateDestroyProject,
    ListCreateFlowsheetObject,
    UpdateFlowsheetObject,
    FlowsheetCreateView,
    ListFlowsheet,
    ListCreateFlowsheet,
    RetrieveUpdateDestroyFlowsheet,
    UpdateFlowsheetPreview,
    DashboardSearch,
    DestroyFlowsheetObject,
)

urlpatterns = [
    path("shapes/", ListCreateShapes.as_view()),
    path("screeners/", ListCreateScreener.as_view()),
    path("screeners/<str:id>", RetrieveUpdateScreener.as_view()),
    path("crushers/", ListCreateCrusher.as_view()),
    path("crushers/<str:id>", RetrieveUpdateCrusher.as_view()),
    path("grinders/", ListCreateGrinder.as_view()),
    path("grinders/<str:id>", RetrieveUpdateGrinder.as_view()),
    path("concentrators/", ListCreateConcentrator.as_view()),
    path("concentrators/<str:id>", RetrieveUpdateConcentrator.as_view()),
    path("auxilliary/", ListCreateAuxilliary.as_view()),
    path("auxilliary/<str:id>", RetrieveUpdateAuxilliary.as_view()),
    path("dashboard_search/", DashboardSearch.as_view()),
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
    path("flowsheet_objects/destroy/", DestroyFlowsheetObject.as_view()),
    path("flowsheet_objects/<str:flowsheet_id>", ListCreateFlowsheetObject.as_view()),
    path(
        "flowsheet_objects/<str:flowsheet_id>/update",
        UpdateFlowsheetObject.as_view(),
    ),
]
