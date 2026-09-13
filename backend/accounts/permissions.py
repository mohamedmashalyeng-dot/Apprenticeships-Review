from rest_framework.permissions import SAFE_METHODS, BasePermission


def _role(request):
    user = request.user
    if not user or not user.is_authenticated:
        return "anon"
    return user.role


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return _role(request) == "admin"


class IsAdminOrModerator(BasePermission):
    def has_permission(self, request, view):
        return _role(request) in ("admin", "moderator")


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return _role(request) == "admin"


class IsCompanyOwnerOfObject(BasePermission):
    """Object-level check: request.user manages the company this object belongs to."""

    def has_object_permission(self, request, view, obj):
        if _role(request) != "company_owner":
            return False
        company = getattr(obj, "company", obj)
        return request.user.managed_company_id is not None and request.user.managed_company_id == company.id
