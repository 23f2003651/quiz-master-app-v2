from flask import render_template, request, jsonify, current_app as app, send_file
from flask_security import SQLAlchemyUserDatastore, current_user, roles_required
from flask_security.utils import hash_password, verify_password
from extensions import db, cache
from models import Role, Chapter, Questions, Scores, Subject, Quiz, User, ScoresHistory
from datetime import datetime
from celery_dir.tasks import add, create_user_data_csv
from celery.result import AsyncResult
from resources import UserAPI
import json

def create_view(app, user_datastore: SQLAlchemyUserDatastore):
        
    @app.get('/create-csv')
    def createCSV():
        task = create_user_data_csv.delay()
        return {'task_id': task.id}
    
    @app.get('/get-csv/<task_id>')
    def getCSV(task_id):
        result = AsyncResult(task_id)
        
        if result.ready():
            return send_file(f'./celery_dir/user_downloads/{result.result}')
        else:
            return {'message': 'task not ready'}, 405

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
        
        if not user.active:
            return jsonify({"message": "User is not active"}), 400
        
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
            
            cache.delete_memoized(UserAPI.get, UserAPI)
            
            return {"message": "User created successfully"}, 200
        
        except Exception as e:
            print("Error creating user: ", e)
            db.session.rollback()
            return {"message": "Error creating user"}, 500

    @app.route('/api/subjects/<int:subject_id>/chapters')
    @cache.memoize(timeout=5)
    def get_chapters(subject_id):
        chapters = Chapter.query.filter_by(subject_id=subject_id).all()
        return jsonify([{"id": c.id, "name": c.name} for c in chapters])
    
    @app.route('/api/submit-quiz', methods=["GET", "POST"])
    @roles_required('user')
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
        quiz = Quiz.query.filter_by(id=quiz_id).first()
        
        correct_answers = {q.id: q.correct_opt for q in questions}
        
        print(answers)
        
        try:
            new_score = Scores(user_answers=json.dumps(answers), correct_answers=json.dumps(correct_answers), user_id=user_id, chapter_id=chapter_id, subject_id=subject_id, quiz_id=quiz_id)
            new_history_score = ScoresHistory(user_answers=json.dumps(answers), correct_answers=json.dumps(correct_answers), user_id=user_id, chapter_id=chapter_id, subject_id=subject_id, quiz_id=quiz_id, quiz_title=quiz.title)
            db.session.add_all([new_score, new_history_score])
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print("Error:", e)
            return jsonify({"error": "Error creating new score"}), 400

        return jsonify({"message": "Score added"}), 201
    
    @app.route('/api/get-scores/<int:id>', methods=["GET"])
    @cache.memoize(timeout=5)
    def get_scores(id):

        scores = Scores.query.filter_by(user_id=id).all()

        if not scores:
            return jsonify({"message": "No scores found for this user"}), 404

        scores_list = []
        for score in scores:
            scores_list.append({
                "id": score.id,
                "time_stamp_of_attempt": score.time_stamp_of_attempt,
                "user_answers": json.loads(score.user_answers),
                "correct_answers": json.loads(score.correct_answers),
                "user_id": score.user_id,
                "chapter_id": score.chapter_id,
                "subject_id": score.subject_id,
                "quiz_id": score.quiz_id
            })

        return jsonify(scores_list), 200
    
    @app.route('/api/get-history-scores/<int:id>', methods=["GET"])
    @cache.memoize(timeout=5)
    def get_history_scores(id):

        scores = ScoresHistory.query.filter_by(user_id=id).all()

        if not scores:
            return jsonify({"message": "No scores found for this user"}), 404

        scores_list = []
        for score in scores:
            scores_list.append({
                "id": score.id,
                "time_stamp_of_attempt": score.time_stamp_of_attempt,
                "user_answers": json.loads(score.user_answers),
                "correct_answers": json.loads(score.correct_answers),
                "user_id": score.user_id,
                "chapter_id": score.chapter_id,
                "subject_id": score.subject_id,
                "quiz_id": score.quiz_id
            })

        return jsonify(scores_list), 200
       
    # Char Data
    @app.route('/api/chart-data/subjects', methods=["GET"])
    @cache.memoize(timeout=5)
    def subject_data():

        subjects = Subject.query.all()
        labels = []
        data = []

        for subject in subjects:
            labels.append(subject.name)
            data.append(len(subject.chapters))
        
        return jsonify([labels, data])
       
    @app.route('/api/chart-data/quizzes', methods=["GET"])
    @cache.memoize(timeout=5)
    def quiz_data():

        quizzes = Quiz.query.all()
        labels = []
        data = []

        for quiz in quizzes:
            labels.append(quiz.title)
            data.append(len(quiz.questions))
        
        return jsonify([labels, data])
       
    @app.route('/api/chart-data/activeUsers', methods=["GET"])
    @cache.memoize(timeout=5)
    def active_users_data():

        users = User.query.all()[1:]
        labels = ["Active", "Inactive"]
        
        active_count = sum(1 for user in users if user.active)
        inactive_count = len(users) - active_count
        
        data = [active_count, inactive_count]
        
        return jsonify([labels, data])
       
    @app.route('/api/chart-data/adminStatsData', methods=["GET"])
    @cache.memoize(timeout=5)
    @roles_required('admin')
    def admin_stats_data():

        total_users = db.session.query(User).count() - 1
        total_subjects = db.session.query(Subject).count()
        total_quizzes = db.session.query(Quiz).count()
        total_chapters = db.session.query(Chapter).count()
        
        return jsonify([total_users, total_subjects, total_quizzes, total_chapters])
    
    @app.route('/api/chart-data/user-scores', methods=["GET"])
    @cache.memoize(timeout=5)
    def user_scores():
        
        def get_score(user_ans, corr_ans):
            score = 0
            total_marks = len(corr_ans)

            for key in corr_ans:
                user_value = user_ans.get(key, "")
                correct_value = corr_ans.get(key, "")

                user_str = str(user_value).strip()
                correct_str = str(correct_value).strip()

                if user_str.isdigit() and correct_str.isdigit():
                    if int(user_str) == int(correct_str):
                        score += 1

            return (score / total_marks) * 100 if total_marks > 0 else 0

        user_id = current_user.id
        scores = ScoresHistory.query.filter_by(user_id=user_id).all()

        total_quizzes = len(scores)

        labels = []
        data = []

        for score in scores:
            user_answers = json.loads(score.user_answers)
            correct_answers = json.loads(score.correct_answers)

            quiz = Quiz.query.filter_by(id=score.quiz_id).first()
            quiz_title = score.quiz_title if not quiz else quiz.title
            
            labels.append(quiz_title)
            data.append(get_score(user_answers, correct_answers))
        
        avg_score = round(sum(data) / total_quizzes, 2) if total_quizzes else 0
        best_score = max(data, default=0)
        worst_score = min(data, default=0)
        
        return jsonify([labels, data, [total_quizzes, avg_score, best_score, worst_score]])

    @app.route('/api/toggleUser/<int:user_id>', methods=["PUT"])
    def toggle_user(user_id):
        
        update_user = User.query.filter_by(id=user_id).first()
        
        if not update_user:
            return jsonify({"message": "User not found"}), 404
        
        update_user.active = not update_user.active
        
        try:
            db.session.commit()
            
            cache.delete_memoized(UserAPI.get, UserAPI)
            
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Error updating user's active field"}), 405
        
        return jsonify({"message": "Successfully updated user's active field"}), 200
    