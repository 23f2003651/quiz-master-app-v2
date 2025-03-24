from celery import shared_task, group
from flask import render_template
from extensions import db
from models import Subject, User, Scores, Quiz
from celery_dir.mail_service import send_email
from datetime import datetime
from pytz import timezone as pytz_timezone, utc
import json
import time
import flask_excel

IST = pytz_timezone('Asia/Kolkata')

@shared_task(ignore_result=False)
def add(x, y):
    time.sleep(10)
    return x+y

@shared_task(bind=True, ignore_result=False)
def create_user_data_csv(self):
    
    def calcScore(user_ans, corr_ans):
        score = 0
        for key in corr_ans:
            if key in user_ans and user_ans[key] == corr_ans[key]:
                score += 1
        return score
    
    users = User.query.all()[1:]
    data = []
    
    task_id = self.request.id
    file_name = f"user_quiz_data_{task_id}.csv"
    
    column_names = ["user_id", "username", "email", "quizzes_taken", "average_score", "best_score", "worst_score"]
    
    for user in users:
        quizzes = Scores.query.filter(Scores.user_id == user.id).all()
        
        total_quizzes = len(quizzes)
        scores = []
        
        for q in quizzes:

            user_answers = json.loads(q.user_answers)
            correct_answers = json.loads(q.correct_answers)
            
            scores.append(calcScore(user_answers, correct_answers))
        
        avg_score = round(sum(scores) / total_quizzes, 2) if total_quizzes else 0
        best_score = max(scores, default=0)
        worst_score = min(scores, default=0)
        
        user_data = [user.id, user.username, user.email, total_quizzes, avg_score, best_score, worst_score]
        
        data.append(user_data)
    
    data.insert(0, column_names)
    
    csv_out = flask_excel.make_response_from_array(data, file_type="csv")
    
    with open(f'./celery_dir/user_downloads/{file_name}', 'wb') as file:
        file.write(csv_out.data)
        
    return file_name

# New quiz alert
@shared_task(ignore_result=True)    
def send_new_quiz_alert():
    
    users = User.query.all()[1:]
    subject = "New Quiz"
    content = "<h3>A new quiz is available to attempt</h3>"
    
    for user in users:
        if user.email:
            send_email(user.email, subject, content)
            print(f"Email sent to {user.email}")

# Daily quiz reminder
@shared_task(ignore_result=True)
def daily_quiz_reminder():
    
    all_users = User.query.all()
    
    alert_users = {}
    
    for user in all_users[1:]:
            
        attempted_quiz_ids = db.session.query(Scores.quiz_id).filter(Scores.user_id == user.id).all()
        attempted_quiz_ids = [quiz_id for (quiz_id,) in attempted_quiz_ids]
        quizzes = Quiz.query.filter(
            ~Quiz.id.in_(attempted_quiz_ids),
            Quiz.date_of_quiz > datetime.now(utc)
        ).all()
        
        if quizzes: 
            alert_users[user.email] = quizzes
        
    if alert_users:
        for email, quizzes in alert_users.items():
            for quiz in quizzes:
                if quiz.date_of_quiz.tzinfo is None:
                    
                    quiz.date_of_quiz = utc.localize(quiz.date_of_quiz)
                quiz.date_of_quiz = quiz.date_of_quiz.astimezone(IST)
                
            send_email(email, "Pending Quizzes", render_template('daily_reminder.html', email=email, quizzes=quizzes))
            
    return "Reminder sent successfully"
    
# User monthly
@shared_task(ignore_result=True)
def send_monthly_report():
    
    def calcScore(user_ans, corr_ans):
        score = 0
        for key in corr_ans:
            if key in user_ans and user_ans[key] == corr_ans[key]:
                score += 1
        return score
    
    first_day_of_month = datetime(datetime.now().year, datetime.now().month, 1)

    users = User.query.all()[1:]
    for user in users:
        quizzes = Scores.query.filter(Scores.user_id == user.id, Scores.time_stamp_of_attempt >= first_day_of_month).all()
        
        print(quizzes)

        total_quizzes = len(quizzes)
        scores = []
        
        for q in quizzes:

            user_answers = json.loads(q.user_answers)
            correct_answers = json.loads(q.correct_answers)
            
            scores.append(calcScore(user_answers, correct_answers))
        
        avg_score = round(sum(scores) / total_quizzes, 2) if total_quizzes else 0
        best_score = max(scores, default=0)
        worst_score = min(scores, default=0)

        report_data = {
            "username": user.username,
            "total_quizzes": total_quizzes,
            "average_score": avg_score,
            "best_score": best_score,
            "worst_score": worst_score,
        }

        send_email(user.email, "Monthly Quiz Activity Report", render_template('monthly_report.html', **report_data))

    return "Monthly reports sent successfully!"

