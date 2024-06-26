# Generated by Django 5.0.6 on 2024-06-04 23:47

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('flowsheet_app', '0002_alter_project_user'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Concentrator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('oid', models.UUIDField(blank=True, null=True, unique=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='')),
                ('description', models.TextField(blank=True, null=True)),
                ('recovery_rate', models.DecimalField(decimal_places=4, max_digits=4)),
                ('dilution_gain', models.DecimalField(decimal_places=4, max_digits=4)),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='concentrators', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Crusher',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('oid', models.UUIDField(blank=True, null=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='')),
                ('type', models.CharField(choices=[('PRIMARY', 'Primary'), ('SECONDARY', 'Secondary'), ('TERTIARY', 'Tertiary')], default='PRIMARY', max_length=30)),
                ('creator', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='crushers', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.DeleteModel(
            name='Concentrators',
        ),
        migrations.AddField(
            model_name='grinder',
            name='creator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='grinders', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='grinder',
            name='oid',
            field=models.UUIDField(blank=True, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='miscellaneous',
            name='creator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='misc', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='miscellaneous',
            name='oid',
            field=models.UUIDField(blank=True, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='miscellaneous',
            name='type',
            field=models.CharField(choices=[('ORE', 'ore'), ('FACILITY', [('STOCKPILE', 'stockpile'), ('BINS', 'bins')])], default='ORE', max_length=40),
        ),
        migrations.AddField(
            model_name='projectobject',
            name='content_type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype'),
        ),
        migrations.AddField(
            model_name='projectobject',
            name='object_id',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='projectobject',
            name='properties',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='screener',
            name='creator',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='screeners', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='screener',
            name='oid',
            field=models.UUIDField(blank=True, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='shape',
            name='oid',
            field=models.UUIDField(blank=True, null=True, unique=True),
        ),
    ]
