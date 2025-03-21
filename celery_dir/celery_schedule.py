from celery import Celery
from flask import current_app as app
from celery.schedules import crontab
from celery_dir.tasks import email_reminder

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender: Celery, **kwargs):
    
    sender.add_periodic_task(crontab(hour=10, minute=25), email_reminder.s('student@gmail', 'reminder to login', '<h1> Hello Everyone </h1'))

