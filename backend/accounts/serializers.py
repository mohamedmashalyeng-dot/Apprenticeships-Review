from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    managedCompanyId = serializers.UUIDField(source="managed_company_id", read_only=True)
    managedCompanySlug = serializers.SlugField(source="managed_company.slug", read_only=True, default=None)
    displayName = serializers.CharField(source="display_name")
    avatarUrl = serializers.CharField(source="avatar_url", required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "email", "role", "managedCompanyId", "managedCompanySlug", "displayName", "avatarUrl"]
        # `email` doubles as the login username (see LoginView), which isn't kept in sync
        # with it — changing email here without also updating `username` and re-verifying
        # would silently break the account's login. No such flow exists yet, so it's
        # read-only until one does.
        read_only_fields = ["id", "role", "email"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    displayName = serializers.CharField(source="display_name", required=False, allow_blank=True)
    pendingRole = serializers.ChoiceField(
        choices=["company_owner"], required=False, write_only=True
    )

    class Meta:
        model = User
        fields = ["email", "password", "displayName", "pendingRole"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        pending_role = validated_data.pop("pendingRole", None)
        password = validated_data.pop("password")
        display_name = validated_data.pop("display_name", "") or validated_data["email"].split("@")[0]
        role = User.Role.COMPANY_OWNER if pending_role == "company_owner" else User.Role.USER
        user = User(
            username=validated_data["email"],
            email=validated_data["email"],
            display_name=display_name,
            role=role,
        )
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
