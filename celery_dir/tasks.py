from celery import shared_task
import time
import flask_excel
from models import Subject

@shared_task(ignore_result=False)
def add(x, y):
    time.sleep(10)
    return x+y

@shared_task(bind=True, ignore_result=False)
def create_csv(self):
    
    resource = Subject.query.all()
    
    task_id = self.request.id
    file_name = f"subject_data_{task_id}.csv"
    
    column_names = [column.name for column in Subject.__table__.columns]
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names=column_names, file_type="csv")
    
    with open(f'./celery_dir/user_downloads/{file_name}', 'wb') as file:
        file.write(csv_out.data)
        
    return file_name
