from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Apprenticeships Reviews", {"fields": ("role", "managed_company", "display_name", "avatar_url")}),
    )
    list_display = ("username", "email", "role", "managed_company", "is_staff")
    list_filter = BaseUserAdmin.list_filter + ("role",)
