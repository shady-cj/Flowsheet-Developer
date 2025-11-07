from django.core.cache import cache


def cache_data(key, value):
    cache.set(key, value)

def get_cache_data(key):
    value = cache.get(key)
    if value:
        return value
    else:
        return None