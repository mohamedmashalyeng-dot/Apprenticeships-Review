from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        USER = "user", "User"
        COMPANY_OWNER = "company_owner", "Company owner"
        MODERATOR = "moderator", "Moderator"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    managed_company = models.ForeignKey(
        "catalog.Company",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="managers",
    )
    display_name = models.CharField(max_length=150, blank=True)
    avatar_url = models.URLField(blank=True)

    def __str__(self) -> str:
        return self.display_name or self.username
