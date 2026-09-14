from django.urls import path

from competitors.views import competitor_detail, competitor_list, competitor_overview

urlpatterns = [
    path("competitors/", competitor_list, name="competitor-list"),
    # Must come before the <slug> pattern below, or "overview" would be swallowed as a slug.
    path("competitors/overview/", competitor_overview, name="competitor-overview"),
    path("competitors/<str:slug>/", competitor_detail, name="competitor-detail"),
]
