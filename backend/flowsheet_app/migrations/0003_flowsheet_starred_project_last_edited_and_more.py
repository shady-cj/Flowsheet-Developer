# Generated by Django 5.1.2 on 2025-01-20 14:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flowsheet_app', '0002_alter_flowsheetobject_flowsheet'),
    ]

    operations = [
        migrations.AddField(
            model_name='flowsheet',
            name='starred',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='project',
            name='last_edited',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='project',
            name='starred',
            field=models.BooleanField(default=False),
        ),
    ]
