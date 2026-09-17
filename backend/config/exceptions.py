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
    # response.data is a dict for field/object-level validation errors (DRF normalizes those
    # via as_serializer_error), but a bare list for a ValidationError raised with a plain
    # string outside of validate() — e.g. from a serializer's create(). Calling .get() on
    # that list would itself raise AttributeError, turning a clean 400 into an unhandled 500.
    detail = response.data.get("detail", response.data) if isinstance(response.data, dict) else response.data
    response.data = {
        "message": _first_message(detail),
        "errors": response.data if isinstance(response.data, dict) else None,
    }
    return response
