from flask import request, jsonify
from flask_restful import Resource, Api, reqparse, fields, marshal_with
from flask_security import auth_required
from models import User
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

# Request parser
user_parser = reqparse.RequestParser()
user_parser.add_argument('email', type=str, required=True, help="Email is required")
user_parser.add_argument('username', type=str, required=True, help="Username is required")
user_parser.add_argument('password', type=str, required=True, help="Password is required")
user_parser.add_argument('qualification', type=str, required=True, help="Qualification is required")

class UserProfile(Resource):
    @marshal_with(user_fields)
    def get(self, id=None):
        if id:
            user = User.query.get(id)
            if user:
                return users, 200
            return {"message": "User not found"}, 404
        
        users = User.query.all()
        return users, 200        
