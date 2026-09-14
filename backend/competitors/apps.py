import logging
import os
import threading

from django.apps import AppConfig

logger = logging.getLogger(__name__)

# Neon is a remote DB with real per-query network latency (and can have a slow "wake up"
# after being idle), so list_competitor_summaries() — ~10 round trips over 203 competitors —
# can take 20+ seconds cold. That cost is paid once here, in the background, instead of by
# whichever visitor's request happens to land on an expired cache entry.
WARM_INTERVAL_SECONDS = 480  # keep the cache (600s TTL) refreshed before it expires


def _warm_loop():
    from django.core.cache import cache
    from django.db import connection

    from competitors import repository

    while True:
        try:
            cache.set("competitors:list", repository.list_competitor_summaries(), 600)
            cache.set("competitors:overview", repository.get_landscape_overview(), 600)
        except Exception:
            logger.exception("competitors cache warm-up failed")
        finally:
            # This thread never goes through Django's per-request connection lifecycle, so
            # its connection is never recycled — Neon closes idle connections server-side,
            # and the next query on the same (now-dead) connection object fails outright.
            # Closing it here forces a fresh connection on the next loop iteration.
            connection.close()
        threading.Event().wait(WARM_INTERVAL_SECONDS)


class CompetitorsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "competitors"

    def ready(self):
        # Guard against management commands (migrate, shell, makemigrations, ...) and the
        # Werkzeug/runserver autoreloader's parent process — only warm in the actual served process.
        if os.environ.get("RUN_MAIN") == "false":
            return
        if os.environ.get("DJANGO_MANAGE_COMMAND") == "1":
            return
        threading.Thread(target=_warm_loop, daemon=True).start()
