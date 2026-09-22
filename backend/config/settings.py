"""
Django settings for the ApprenticeshipsReviews API.
"""

import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env.local")

SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = os.environ.get("DJANGO_DEBUG", "False") == "True"
ALLOWED_HOSTS = [h.strip() for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",") if h.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.postgres",
    "corsheaders",
    "rest_framework",
    "accounts",
    "catalog",
    "reviews",
    "competitors",
    "chatbot",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    # The Neon DB is remote (high per-round-trip latency), and each new connection needs
    # a fresh TLS + SCRAM handshake (~1.5-2s). CONN_MAX_AGE keeps each worker's connection
    # open across requests instead of reconnecting every time — this only pays off when
    # the server process has a persistent, reused thread/worker pool (e.g. waitress),
    # since Django's dev `runserver` spawns a brand new thread per request by default and
    # would reconnect just as often as with no pooling at all.
    "default": dj_database_url.parse(os.environ["DATABASE_URL"], conn_max_age=600)
}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---- REST framework ----
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ] + (["rest_framework.renderers.BrowsableAPIRenderer"] if DEBUG else []),
    "DEFAULT_THROTTLE_RATES": {
        "chatbot": os.environ.get("CHATBOT_THROTTLE_RATE", "20/hour"),
    },
    "EXCEPTION_HANDLER": "config.exceptions.api_exception_handler",
}

# ---- Session / CSRF cookies ----
# In dev the SPA reaches the API through the Vite proxy, so it's same-origin and Lax
# cookies work fine. In production the SPA (Hostinger) and API (Render, or a tunnel) are on
# different domains, so the browser needs SameSite=None (which requires Secure) to send
# cookies on cross-origin fetches.
#
# This is deliberately NOT tied to DEBUG: DEBUG controls error verbosity, but a Secure
# cookie is rejected outright by the browser over plain http:// — which is exactly how
# local testing hits this server (http://localhost:3000 via the Vite proxy), regardless
# of DEBUG. Tying cookie security to DEBUG silently breaks local login. COOKIE_SAMESITE /
# COOKIE_SECURE let each be set independently when this same server is temporarily exposed
# cross-domain (e.g. via a tunnel) for a deployed-frontend test.
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "Lax")
CSRF_COOKIE_HTTPONLY = False  # the SPA must be able to read this and echo it back as a header
CSRF_COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "Lax")
SESSION_COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "False") == "True"
CSRF_COOKIE_SECURE = SESSION_COOKIE_SECURE

CORS_ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

# The Vite dev proxy forwards requests with `Origin: http://localhost:3000` but rewrites the
# `Host` header to the Django target — Django's CSRF Origin check compares those and rejects
# the mismatch unless the frontend origin is explicitly trusted here.
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# ---- Email (password reset) ----
# No SMTP provider is configured yet, so emails are printed to the server console/log
# instead of actually sent. Set EMAIL_HOST/EMAIL_HOST_USER/EMAIL_HOST_PASSWORD in
# .env.local and EMAIL_BACKEND to django.core.mail.backends.smtp.EmailBackend to send
# real email in production.
EMAIL_BACKEND = os.environ.get("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True") == "True"
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@apprenticeshipsreviews.example")

# Used to build the password-reset link emailed to users (the API doesn't know the SPA's origin).
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# ---- Chatbot (via OpenAI Responses API) ----
# Server-side only — never exposed to the frontend. Left blank the chatbot endpoint
# responds 503 instead of erroring, so a missing key doesn't break the rest of the app.
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5-mini")
OPENAI_MAX_OUTPUT_TOKENS = int(os.environ.get("OPENAI_MAX_OUTPUT_TOKENS", "500"))
