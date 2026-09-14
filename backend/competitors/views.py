from django.core.cache import cache
from django.http import Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from competitors import repository

# This data is refreshed by a separate, periodic collector (not by anything on this site) —
# a short cache turns "every visitor pays for ~10 remote-DB round trips" into "one visitor
# every few minutes does, everyone else gets it from memory."
LIST_CACHE_TTL = 600
DETAIL_CACHE_TTL = 600
OVERVIEW_CACHE_TTL = 600


@api_view(["GET"])
@permission_classes([AllowAny])
def competitor_list(request):
    data = cache.get("competitors:list")
    if data is None:
        data = repository.list_competitor_summaries()
        cache.set("competitors:list", data, LIST_CACHE_TTL)
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def competitor_overview(request):
    data = cache.get("competitors:overview")
    if data is None:
        data = repository.get_landscape_overview()
        cache.set("competitors:overview", data, OVERVIEW_CACHE_TTL)
    return Response(data)


@api_view(["GET"])
@permission_classes([AllowAny])
def competitor_detail(request, slug):
    cache_key = f"competitors:detail:{slug}"
    data = cache.get(cache_key)
    if data is None:
        data = repository.get_competitor_detail(slug)
        if data is None:
            raise Http404
        cache.set(cache_key, data, DETAIL_CACHE_TTL)
    return Response(data)
