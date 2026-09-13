from django.http import Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from competitors import repository


@api_view(["GET"])
@permission_classes([AllowAny])
def competitor_list(request):
    return Response(repository.list_competitor_summaries())


@api_view(["GET"])
@permission_classes([AllowAny])
def competitor_detail(request, slug):
    data = repository.get_competitor_detail(slug)
    if data is None:
        raise Http404
    return Response(data)
