from flask import render_template, request, jsonify
from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password, verify_password
from extensions import db
from models import Role, Chapter

def create_view(app, user_datastore: SQLAlchemyUserDatastore):

    @app.route('/')
    def home():
        return render_template('index.html')
    
    @app.route('/user-login', methods=['POST'])
    def user_login():
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"message": "not valid email or password"}), 400
        
        user = user_datastore.find_user(email=email)
        roles = [role.name for role in user.roles]
        
        if not user:
            return jsonify({"message": "invalid user"}), 401
        
        if verify_password(password, user.password):
            return jsonify({"token": user.get_auth_token(), "role": roles[0], "id": user.id, "email": user.email}), 200
        else:
            return jsonify({"message": "incorrect password"}), 401
    
    @app.route('/user-register', methods=['POST'])
    def user_register():
        
        # getting the data from the request
        data = request.get_json()
        
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        password2 = data.get('password2')
        qualification = data.get('qualification')
        
        if not email or not username or not password or not qualification:
            return {"message": "All fields are required"}, 400
        
        if password != password2:
            return {"message": "Passwords do not match"}, 400
        
        if user_datastore.find_user(email=email):
            return {"message": "User already exists"}, 400
        
        try:
            user_role = Role.query.filter_by(name="user").first()

            if not user_datastore.find_user(email=email):
                new_user = user_datastore.create_user(
                    email=email,
                    password=hash_password(password),
                    username=username,
                    qualification=qualification,
                    active=False,
                    roles=[user_role]
                )
            
            db.session.commit()
            return {"message": "User created successfully"}, 200
        
        except Exception as e:
            print("Error creating user: ", e)
            db.session.rollback()
            return {"message": "Error creating user"}, 500

    @app.route('/api/subjects/<int:subject_id>/chapters')
    def get_chapters(subject_id):
        chapters = Chapter.query.filter_by(subject_id=subject_id).all()
        return jsonify([{"id": c.id, "name": c.name} for c in chapters])
