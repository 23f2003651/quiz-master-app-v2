from flask import render_template, request, jsonify
from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password, verify_password
from extensions import db

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
        
        if not user:
            return jsonify({"message": "invalid user"}), 401
        
        if verify_password(password, user.password):
            return jsonify({"token": user.get_auth_token(), "role": "user", "id": user.id, "email": user.email}), 200
        else:
            return jsonify({"message": "incorrect password"}), 401
    
    @app.route('/user-register', methods=['POST'])
    def user_register():
        
        # getting the data from the request
        data = request.get_json()
        
        email = data.get('email')
        username = data.get('username')
        password1 = data.get('password1')
        password2 = data.get('password2')
        qualification = data.get('qualification')
        role = "user"
        
        if password1 != password2:
            return jsonify({"message": "Passwords do not match"}), 400
        
        if user_datastore.find_user(email=email):
            return jsonify({"message": "User already exists"}), 400
        
        # creating new user
        try:
            new_user = user_datastore.create_user(email=email, username=username, password=hash_password(password1), qualification=qualification, active=False, role_id=2)
            user_datastore.add_role_to_user(new_user, role)
        except Exception as e:
            print("Error creating user: ", e)
            return jsonify({"message": "Error creating user"}), 500
        
        try:
            db.session.commit()
            return jsonify({"message": "User created successfully"}), 201
        except Exception as e:
            print("Error commiting user: ", e)
            return jsonify({"message": "Error creating user"}), 500
    