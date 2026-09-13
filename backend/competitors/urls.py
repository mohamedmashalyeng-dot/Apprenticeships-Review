from django.urls import path

from competitors.views import competitor_detail, competitor_list

urlpatterns = [
    path("competitors/", competitor_list, name="competitor-list"),
    path("competitors/<str:slug>/", competitor_detail, name="competitor-detail"),
]
