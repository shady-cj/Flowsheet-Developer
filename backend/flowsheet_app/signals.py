from django.db.models.signals import post_save, post_delete
from django.core.cache import cache
from django.dispatch import receiver
# from django_redis import get_redis_connection
## get_redis_connection("default") or cache.client.get_client()

from .models import (
                    Project, 
                    Flowsheet, 
                    Shape, 
                    Crusher, 
                    Grinder,
                    Screener,
                    Concentrator,
                    Auxilliary
                ) 

def invalidate_project_cache(instance, deleted=False):
    # delete key allprojects:user:{user_id}:*
    # user id is the creator of the project

    client = cache.client.get_client()
    user_id = str(instance.creator.id)
    # delete key projects:{project_id}:project-detail
    project_id = str(instance.id)
    cache.delete(f"projects:{project_id}:project-detail")

    #delete key allflowsheets:project:{project_id}
    cache.delete(f"allflowsheets:project:{project_id}")

    #delete key flowsheetcreateview:user:{user.id}
    cache.delete(f"flowsheetcreateview:user:{user_id}")

    #delete key allprojects:user:{user_id}:*
    for key in client.scan_iter(match=f"*allprojects:user:{user_id}:*"):
        client.delete(key)
     


    if deleted:
        # delete allflowsheets:user:{user_id}:*
        for key in client.scan_iter(match=f"*allflowsheets:user:{user_id}:*"):
            client.delete(key)

def invalidate_flowsheet_cache(instance):
    # delete projects:{project_id}:project-detail
    client = cache.client.get_client()
    project_id = str(instance.project.id)
    user_id = str(instance.project.creator.id)
    cache.delete(f"projects:{project_id}:project-detail")

    # delete flowsheets:{flowsheet_id}:flowsheet-detail
    flowsheet_id = str(instance.id)
    cache.delete(f"flowsheets:{flowsheet_id}:flowsheet-detail")

    # delete allflowsheets:project:{project_id}
    cache.delete(f"allflowsheets:project:{project_id}")

    # delete allflowsheets:user:{user_id}:{full_url_path}
    for key in client.scan_iter(match=f"*allflowsheets:user:{user_id}:*"):
        client.delete(key)

    # delete flowsheetcreateview:user:{user.id}
    cache.delete(f"flowsheetcreateview:user:{user_id}")

        

@receiver(post_save, sender=Project)
def invalidate_project_cache_on_save(sender, instance, *args, **kwargs):
    try:
        invalidate_project_cache(instance)
    except:
        pass


@receiver(post_delete, sender=Project)
def invalidate_project_cache_on_delete(sender, instance, *args, **kwargs):
    try:
        invalidate_project_cache(instance, deleted=True)
    except:
        pass



@receiver(post_save, sender=Flowsheet)
def invalidate_flowsheet_cache_on_save(sender, instance, *args, **kwargs):
    try:
        invalidate_flowsheet_cache(instance)
    except:
        pass


@receiver(post_delete, sender=Flowsheet)
def invalidate_flowsheet_cache_on_delete(sender, instance, *args, **kwargs):
    try:
        invalidate_flowsheet_cache(instance)
    except:
        pass



map_component_to_url = {
    Shape: "/shapes/",
    Crusher: "/crushers/",
    Grinder: "/grinders/",
    Screener: "/screeners/",
    Concentrator: "/concentrators/",
    Auxilliary: "/auxilliary/"
}



def delete_components_from_cache_for_all_users(url):
    client = cache.client.get_client()

    for key in client.scan_iter(match=f"*user:*:{url}"):
        client.delete(key)



# for model in [Project, Flowsheet]:
#     post_delete.connect(invalidate_cache_on_delete, sender=model)


@receiver(post_save, sender=Shape)
@receiver(post_save, sender=Crusher)
@receiver(post_save, sender=Grinder)
@receiver(post_save, sender=Screener)
@receiver(post_save, sender=Concentrator)
@receiver(post_save, sender=Auxilliary)
def invalidate_component_cache_on_delete(sender, instance, *args, **kwargs):
    try:
        #delete key user:{user.id}:{get_full_path}"

        url = map_component_to_url[sender]
        if sender == Shape:
            # delete all cached shapes
            # key user:*:/shapes/
            delete_components_from_cache_for_all_users(url)
        else:
            user = instance.creator
            if user.is_superuser:
               # key user:*:url
               delete_components_from_cache_for_all_users(url)
            else:
                cache.delete(f"user:{str(user.id)}:{url}")
    except:
        pass