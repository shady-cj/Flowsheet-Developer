from .models import User
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)



@receiver(post_delete, sender=User)
@receiver(post_save, sender=User)
def clear_user_detail_cache(sender, instance, *args, **kwargs):
    cache_key = f"user-detail-{instance.id}"
    try:
        cache.delete(cache_key)
    except Exception as e:
        logger.error(f"Failed to clear user cache for {cache_key}: {e}")

