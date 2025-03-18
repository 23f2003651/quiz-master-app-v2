import json
from flask import render_template, request, jsonify
from flask_security import SQLAlchemyUserDatastore, current_user
from flask_security.utils import hash_password, verify_password
from extensions import db
from models import Role, Chapter, Questions, Scores

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
    
    @app.route('/api/submit-quiz', methods=["GET", "POST"])
    def submit_quiz():
        data = request.get_json();
        answers = data.get('answers')
        quiz_id = data.get('quiz_id')
        chapter_id = data.get('chapter_id')
        subject_id = data.get('subject_id')        
        user_id = current_user.id
        
        if not chapter_id or not subject_id or not quiz_id:
            return jsonify({"error": "Invalid request"}), 400
        
        questions = Questions.query.filter_by(quiz_id=quiz_id).all()
        correct_answers = {q.id: q.correct_opt for q in questions}
        
        print(answers)
        
        try:
            new_score = Scores(user_answers=json.dumps(answers), correct_answers=json.dumps(correct_answers), user_id=user_id, chapter_id=chapter_id, subject_id=subject_id)
            db.session.add(new_score)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print("Error:", e)
            return jsonify({"error": "Error creating new score"}), 400

        return jsonify({"message": "Score added"}), 201