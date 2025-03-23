from flask import request, jsonify
from flask_restful import Resource, Api, reqparse, fields, marshal_with
from flask_security import auth_required, current_user
from models import User, Subject, Chapter, Quiz, Questions, Scores
from extensions import db, cache
from datetime import datetime, timezone
from celery_dir.tasks import send_new_quiz_alert
import pytz

api = Api(prefix='/api')

# Fields to be returned in the response
user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'qualification': fields.String,
    'active': fields.Boolean,
    'attempted': fields.Boolean
}

chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer
}

subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'chapters': fields.List(fields.Nested(chapter_fields))
}

questions_fields = {
    'id': fields.Integer,
    'question_statement': fields.String,
    'opt1': fields.String,
    'opt2': fields.String,
    'opt3': fields.String,
    'opt4': fields.String,
    'correct_opt': fields.Integer,
    'quiz_id': fields.Integer
}

quiz_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'duration': fields.Integer,
    'date_of_quiz': fields.DateTime,
    'chapter_id': fields.Integer,
    'subject_id': fields.Integer,
    'questions': fields.List(fields.Nested(questions_fields))
}

# Request parser
user_parser = reqparse.RequestParser()
user_parser.add_argument('email', type=str, required=True, help="Email is required")
user_parser.add_argument('username', type=str, required=True, help="Username is required")
user_parser.add_argument('password', type=str, required=True, help="Password is required")
user_parser.add_argument('qualification', type=str, required=True, help="Qualification is required")
user_parser.add_argument('active', type=bool, required=True, help="Actice is required")
user_parser.add_argument('attempted', type=bool, required=True, help="Attempted is required")

subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help="Name is required")
subject_parser.add_argument('description', type=str, required=True, help="Description is required")

chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help="Name is required")
chapter_parser.add_argument('description', type=str, required=True, help="Description is required")
chapter_parser.add_argument('subject_id', type=int, required=True, help="Subject ID is required")

question_parser = reqparse.RequestParser()
question_parser.add_argument('question_statement', type=str, required=True, help="Question Statement is required")
question_parser.add_argument('opt1', type=str, required=True, help="Option 1 is required")
question_parser.add_argument('opt2', type=str, required=True, help="Option 2 is required")
question_parser.add_argument('opt3', type=str, required=True, help="Option 3 is required")
question_parser.add_argument('opt4', type=str, required=True, help="Option 4 is required")
question_parser.add_argument('correct_opt', type=int, required=True, help="Correct option is required")
question_parser.add_argument('quiz_id', type=int, required=True, help="Quiz ID is required")

# Users API
class UserAPI(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(user_fields)
    def get(self, id=None):
        if id:
            user = User.query.filter_by(id=id).first()
            if user:
                return user, 200
            return {"message": "User not found"}, 404 
        
        users = User.query.all()
        if users:
            return users, 200
        return {"message": "No users found"}, 404
    
# Subjects API
class SubjectAPI(Resource):
    @auth_required('token')
    @cache.cached(timeout=5, key_prefix="subjects_key")
    @marshal_with(subject_fields)
    def get(self):
        
        subjects = Subject.query.all()
        if subjects:
            return subjects, 200
        return {"message": "No subjects found"}, 404
    
    @auth_required('token')
    def post(self, id=None):
        
        data = request.get_json();
        
        name = data.get('name');
        description = data.get('description');
        
        if not name or not description:
            return {"message": "All fields are required"}, 400
        
        subject = Subject.query.filter_by(name=name).first()
        if subject:
            return {"message": "Subject already exists"}, 400
        
        try:
            new_subject = Subject(name=name, description=description)
            db.session.add(new_subject)
            db.session.commit()
            
            cache.delete("subjects_key")
            
            return {"message": "Subject created successfully"}, 201
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
    
    @auth_required('token')
    def delete(self, id):
        subject = Subject.query.filter_by(id=id).first()
        if not subject:
            return {"message": "Subject not found"}, 404
        
        try:
            db.session.delete(subject)
            db.session.commit()
            
            cache.delete("subjects_key")
            
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
        
        return {"message": "Subject deleted successfully"}, 204
    
    @auth_required('token')
    def put(self, id):
        subject = Subject.query.filter_by(id=id).first()
        if not subject:
            return {"message": "Subject not found"}, 404
        
        data = request.get_json();
        
        name = data.get('name');
        description = data.get('description');
        
        if not name or not description:
            return {"message": "All fields are required"}, 400
        
        subject.name = name
        subject.description = description
        
        try:
            db.session.commit()
            
            cache.delete("subjects_key")
            
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
        
        return {"message": "Subject updated successfully"}, 204
    
# Chapters API
class ChapterAPI(Resource):
    @auth_required('token')
    @cache.cached(timeout=5, key_prefix="chapters_key")
    @marshal_with(chapter_fields)
    def get(self):
        
        chapters = Chapter.query.all()
        if chapters:
            return chapters, 200
        return {"message": "No chapters found"}, 404
    
    @auth_required('token')
    def post(self):
        data = request.get_json();
        
        name = data.get('name');
        description = data.get('description');
        subject_id = data.get('subject_id');
        
        if not name or not description or not subject_id:
            return {"message": "All fields are required"}, 400
        
        chapter = Chapter.query.filter_by(name=name).first()
        if chapter:
            return {"message": "Chapter already exists"}, 400
        
        try:
            new_chapter = Chapter(name=name, description=description, subject_id=subject_id)
            db.session.add(new_chapter)
            db.session.commit()
            
            cache.delete("chapters_key")
            cache.delete("subjects_key")
            
            return {"message": "Chapter created successfully"}, 201
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
        
    @auth_required('token')
    def delete(self, id):
        chapter = Chapter.query.filter_by(id=id).first()
        if not chapter:
            return {"message": "Chapter not found"}, 404
        
        try:
            db.session.delete(chapter)
            db.session.commit()
            
            cache.delete("chapters_key")
            cache.delete("subjects_key")
            
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
        
        return {"message": "Chapter deleted successfully"}, 204
    
    @auth_required('token')
    def put(self, id):
        chapter = Chapter.query.filter_by(id=id).first()
        if not chapter:
            return {"message": "Chapter not found"}, 404
        
        data = request.get_json();
        
        name = data.get('name');
        description = data.get('description');
        
        if not name or not description:
            return {"message": "All fields are required"}, 400
        
        chapter.name = name
        chapter.description = description
        
        try:
            db.session.commit()
            
            cache.delete("chapters_key")
            cache.delete("subjects_key")
            
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
        
        return {"message": "Chapter updated successfully"}, 204
  
# Quiz API
class QuizAPI(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(quiz_fields)
    def get(self, id=None):
        user_id = current_user.id
        user_role = current_user.roles[0].name

        if id:
            quiz = Quiz.query.filter_by(id=id).first()
            if quiz:
                return quiz, 200
            return {"message": "Quiz not found"}, 404

        if user_role == "admin":
            quizzes = Quiz.query.all()
            
        else:
            attempted_quiz_ids = db.session.query(Scores.quiz_id).filter(Scores.user_id == user_id).all()
            attempted_quiz_ids = [quiz_id for (quiz_id,) in attempted_quiz_ids]
            quizzes = Quiz.query.filter(~Quiz.id.in_(attempted_quiz_ids), Quiz.date_of_quiz > datetime.now(timezone.utc)).all()

        if quizzes:
            return quizzes, 200
        return {"message": "No quizzes found"}, 404
    
    @auth_required('token')
    def post(self):
        data = request.get_json()

        title = data.get('title')
        duration = data.get('duration', 600)
        date_of_quiz = data.get('date_of_quiz')
        chapter_id = data.get('chapter_id')
        subject_id = data.get('subject_id')

        if not title or not chapter_id:
            return {"message": "All fields are required"}, 400

        if date_of_quiz:
            try:
                ist = pytz.timezone('Asia/Kolkata')
                utc = pytz.utc
                
                date_of_quiz_ist = datetime.strptime(date_of_quiz, "%Y-%m-%dT%H:%M")  
                
                date_of_quiz_utc = ist.localize(date_of_quiz_ist).astimezone(utc)
            
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DDTHH:MM"}, 400

        try:
            new_quiz = Quiz(
                title=title,
                duration=duration,
                date_of_quiz=date_of_quiz_utc,
                chapter_id=chapter_id,
                subject_id=subject_id
            )
            
            db.session.add(new_quiz)
            db.session.commit()
            
            cache.delete_memoized(self.get)
            
            send_new_quiz_alert()

            return {"message": "Quiz created successfully"}, 201

        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
    
    @auth_required('token')
    def delete(self, id):
        quiz = Quiz.query.filter_by(id=id).first()
        if not quiz:
            return {"message": "Quiz not found"}, 404
        
        try:
            db.session.delete(quiz)
            db.session.commit()
            
            cache.delete_memoized(self.get)
            
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
        return {"message": "Quiz deleted successfully"}, 204
    
    @auth_required('token')
    def put(self, id):
        quiz = Quiz.query.filter_by(id=id).first()
        if not quiz:
            return {"message": "Quiz not found"}, 404

        data = request.get_json()

        title = data.get('title')
        duration = data.get('duration', 600)
        date_of_quiz = data.get('date_of_quiz')
        subject_id = data.get('subject_id')
        chapter_id = data.get('chapter_id')

        if not title or not chapter_id:
            return {"message": "All fields are required"}, 400

        if date_of_quiz:
            try:
                ist = pytz.timezone('Asia/Kolkata')
                utc = pytz.utc

                date_of_quiz_ist = datetime.strptime(date_of_quiz, "%Y-%m-%dT%H:%M")
                date_of_quiz_utc = ist.localize(date_of_quiz_ist).astimezone(utc)
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DDTHH:MM"}, 400

            quiz.date_of_quiz = date_of_quiz_utc

        quiz.title = title
        quiz.duration = duration
        quiz.chapter_id = chapter_id
        quiz.subject_id = subject_id

        try:
            db.session.commit()
            cache.delete_memoized(self.get)
            return {"message": "Quiz updated successfully"}, 200  # Changed 204 to 200 to return a message

        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


# Questions API
class QuestionsAPI(Resource):
    @auth_required('token')
    @cache.cached(timeout=5, key_prefix="questions_key")
    @marshal_with(questions_fields)
    def get(self):
        
        question = Questions.query.all()
        if question:
            return question, 200
        return {"message": "No question found"}, 404
    
    @auth_required('token')
    def post(self):
        data = request.get_json()
        
        question_statement = data.get('question_statement')
        opt1 = data.get('opt1')
        opt2 = data.get('opt2')
        opt3 = data.get('opt3')
        opt4 = data.get('opt4')
        correct_opt = data.get('correct_opt')
        quiz_id = data.get('quiz_id')
        
        if not question_statement or not opt1 or not opt2 or not opt3 or not opt4 or not correct_opt or not quiz_id:
            return {"message": "All fields are required"}, 400
        
        try:
            new_question = Questions(
                question_statement=question_statement,
                opt1=opt1,
                opt2=opt2,
                opt3=opt3,
                opt4=opt4,
                correct_opt=correct_opt,
                quiz_id=quiz_id
            )
            db.session.add(new_question)
            db.session.commit()
            
            cache.delete("questions_key")
            cache.delete_memoized(QuizAPI.get, QuizAPI)
            
            return {"message": "Question created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @auth_required('token')
    def delete(self, id):
        question = Questions.query.filter_by(id=id).first()
        if not question:
            return {"message": "Question not found"}, 404
        
        try:
            db.session.delete(question)
            db.session.commit()
            
            cache.delete("questions_key")
            cache.delete_memoized(QuizAPI.get, QuizAPI)
            
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
        
        return {"message": "Question deleted successfully"}, 204
    
    @auth_required('token')
    def put(self, id):
        question = Questions.query.filter_by(id=id).first()
        if not question:
            return {"message": "Question not found"}, 404
        
        data = request.get_json();
        
        question_statement = data.get('question_statement')
        opt1 = data.get('opt1')
        opt2 = data.get('opt2')
        opt3 = data.get('opt3')
        opt4 = data.get('opt4')
        correct_opt = data.get('correct_opt')
        
        if not question_statement or not opt1 or not opt2 or not opt3 or not opt4 or not correct_opt:
            return {"message": "All fields are required"}, 400
        
        question.question_statement = question_statement
        question.opt1 = opt1
        question.opt2 = opt2
        question.opt3 = opt3
        question.opt4 = opt4
        question.correct_opt = correct_opt
        
        try:
            db.session.commit()
            
            cache.delete("questions_key")
            cache.delete_memoized(QuizAPI.get, QuizAPI)
            
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
        
        return {"message": "Question updated successfully"}, 204

# api routes
api.add_resource(UserAPI, '/users/<int:id>', '/users')
api.add_resource(SubjectAPI, '/subjects/<int:id>', '/subjects')
api.add_resource(ChapterAPI, '/chapters/<int:id>', '/chapters')
api.add_resource(QuizAPI, '/quiz/<int:id>', '/quiz')
api.add_resource(QuestionsAPI, '/questions/<int:id>', '/questions')
