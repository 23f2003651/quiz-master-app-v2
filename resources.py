from flask import request, jsonify
from flask_restful import Resource, Api, reqparse, fields, marshal_with
from flask_security import auth_required
from models import User, Subject, Chapter, Quiz, Questions, Scores
from extensions import db
from datetime import datetime

api = Api(prefix='/api')

# Fields to be returned in the response
user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'qualification': fields.String
}

subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String
}

chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer
}

quiz_fields = {
    'id': fields.Integer,
    'remarks': fields.String,
    'duration': fields.Integer,
    'start_time': fields.DateTime,
    'chapter_id': fields.Integer
}

# Request parser
user_parser = reqparse.RequestParser()
user_parser.add_argument('email', type=str, required=True, help="Email is required")
user_parser.add_argument('username', type=str, required=True, help="Username is required")
user_parser.add_argument('password', type=str, required=True, help="Password is required")
user_parser.add_argument('qualification', type=str, required=True, help="Qualification is required")

subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help="Name is required")
subject_parser.add_argument('description', type=str, required=True, help="Description is required")

chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help="Name is required")
chapter_parser.add_argument('description', type=str, required=True, help="Description is required")
chapter_parser.add_argument('subject_id', type=int, required=True, help="Subject ID is required")

class UserAPI(Resource):
    @auth_required('token')
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
        
class SubjectAPI(Resource):
    @auth_required('token')
    @marshal_with(subject_fields)
    def get(self, id=None):
        if id:
            subject = Subject.query.filter_by(id=id).first()
            if subject:
                return subject, 200
            return {"message": "Subject not found"}, 404
        
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
            return {"message": "Subject created successfully"}, 201
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
        
class ChapterAPI(Resource):
    @auth_required('token')
    @marshal_with(chapter_fields)
    def get(self, id=None):
        if id:
            chapter = Chapter.query.filter_by(id=id).first()
            if chapter:
                return chapter, 200
            return {"message": "Chapter not found"}, 404
        
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
            return {"message": "Chapter created successfully"}, 201
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500
    
class QuizAPI(Resource):
    @auth_required('token')
    @marshal_with(quiz_fields)
    def get(self, id=None):
        if id:
            quiz = Quiz.query.filter_by(id=id).first()
            if quiz:
                return quiz, 200
            return {"message": "Quiz not found"}, 404
        
        quizzes = Quiz.query.all()
        if quizzes:
            return quizzes, 200
        return {"message": "No quizzes found"}, 404
    
    @auth_required('token')
    def post(self):
        
        data = request.get_json();
        
        remarks = data.get('remarks');
        duration = data.get('duration', 600);
        start_time = data.get('start_time');
        chapter_id = data.get('chapter_id');
        
        if not remarks or not chapter_id:
            return {"message": "All fields are required"}, 400
        
        if start_time:
            try:
                start_time = datetime.fromisoformat(start_time)
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DDTHH:MM:SS"}, 400
        
        try:
            new_quiz = Quiz(remarks=remarks, duration=duration, start_time=start_time, chapter_id=chapter_id)
            db.session.add(new_quiz)
            db.session.commit()
            return {"message": "Quiz created successfully"}, 201
        except Exception as e:
            db.session.rollback();
            return {"message": str(e)}, 500

# api routes
api.add_resource(UserAPI, '/users/<int:id>', '/users')
api.add_resource(SubjectAPI, '/subjects/<int:id>', '/subjects')
api.add_resource(ChapterAPI, '/chapters/<int:id>', '/chapters')
api.add_resource(QuizAPI, '/quiz/<int:id>', '/quiz')
