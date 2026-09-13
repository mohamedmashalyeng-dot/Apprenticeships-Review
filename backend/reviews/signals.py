from django.db.models import Avg, Count
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from catalog.models import Company
from reviews.models import Review


def recalculate_company_stats(company_id):
    if company_id is None:
        return
    stats = Review.objects.filter(
        company_id=company_id, moderation_status=Review.ModerationStatus.APPROVED
    ).aggregate(avg=Avg("rating"), count=Count("id"))
    Company.objects.filter(id=company_id).update(
        average_rating=round(stats["avg"] or 0, 1),
        total_reviews=stats["count"] or 0,
    )


@receiver(post_save, sender=Review)
def review_saved(sender, instance, **kwargs):
    recalculate_company_stats(instance.company_id)


@receiver(post_delete, sender=Review)
def review_deleted(sender, instance, **kwargs):
    recalculate_company_stats(instance.company_id)
