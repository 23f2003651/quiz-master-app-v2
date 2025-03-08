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

# Request parser
user_parser = reqparse.RequestParser()
user_parser.add_argument('email', type=str, required=True, help="Email is required")
user_parser.add_argument('username', type=str, required=True, help="Username is required")
user_parser.add_argument('password', type=str, required=True, help="Password is required")
user_parser.add_argument('qualification', type=str, required=True, help="Qualification is required")

subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help="Name is required")
subject_parser.add_argument('description', type=str, required=True, help="Description is required")

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
        
        

# api routes
api.add_resource(UserAPI, '/users/<int:id>', '/users')
api.add_resource(SubjectAPI, '/subjects/<int:id>', '/subjects')
