from celery import Celery
from flask import current_app as app
from celery.schedules import crontab
from celery_dir.tasks import daily_quiz_reminder, send_monthly_report
from extensions import db

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender: Celery, **kwargs):
    
    # Daily quiz reminder
    sender.add_periodic_task(crontab(hour=10, minute=18), daily_quiz_reminder.s())

    # Monthly report
    sender.add_periodic_task(crontab(hour=10, minute=18), send_monthly_report.s())
