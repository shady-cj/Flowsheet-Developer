# Generated by Django 5.0.6 on 2024-06-08 11:45

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flowsheet_app', '0004_alter_miscellaneous_options_crusher_gape_crusher_set_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='project',
            old_name='user',
            new_name='creator',
        ),
        migrations.RemoveField(
            model_name='concentrator',
            name='oid',
        ),
        migrations.RemoveField(
            model_name='crusher',
            name='oid',
        ),
        migrations.RemoveField(
            model_name='grinder',
            name='oid',
        ),
        migrations.RemoveField(
            model_name='miscellaneous',
            name='oid',
        ),
        migrations.RemoveField(
            model_name='screener',
            name='oid',
        ),
        migrations.RemoveField(
            model_name='shape',
            name='oid',
        ),
        migrations.AddField(
            model_name='projectobject',
            name='oid',
            field=models.UUIDField(default=uuid.uuid4, unique=True),
        ),
    ]
