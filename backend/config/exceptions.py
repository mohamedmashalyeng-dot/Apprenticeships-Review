from rest_framework.views import exception_handler


def _first_message(detail):
    if isinstance(detail, str):
        return detail
    if isinstance(detail, list) and detail:
        return _first_message(detail[0])
    if isinstance(detail, dict) and detail:
        return _first_message(next(iter(detail.values())))
    return "Something went wrong."


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None
    detail = response.data.get("detail", response.data)
    response.data = {
        "message": _first_message(detail),
        "errors": response.data if isinstance(response.data, dict) else None,
    }
    return response
