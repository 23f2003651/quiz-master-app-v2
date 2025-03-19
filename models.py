from sqlalchemy import DateTime, func
from extensions import db
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsqla

fsqla.FsModels.set_db_info(db)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    qualification = db.Column(db.String(50), nullable=False)
    active = db.Column(db.Boolean)
    attempted = db.Column(db.Boolean, nullable=False, default=False)
    fs_uniquifier = db.Column(db.String(65), unique=True, nullable=False)
    
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id', ondelete='CASCADE'))

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(100), nullable=False)
    
    chapters = db.relationship("Chapter", backref="subject", lazy=True, cascade="all, delete-orphan")
    
class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(100), nullable=False)
    
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True, cascade="all, delete-orphan")
    
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    duration = db.Column(db.Integer, nullable=False, default=600)
    date_of_quiz = db.Column(DateTime, nullable=True)
    
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapter.id"), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subject.id"), nullable=False)
    
    questions = db.relationship("Questions", backref="quiz", lazy=True, cascade="all, delete-orphan")
    
class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_statement = db.Column(db.String(100), nullable=False)
    opt1 = db.Column(db.String(50), nullable=False)
    opt2 = db.Column(db.String(50), nullable=False)
    opt3 = db.Column(db.String(50), nullable=False)
    opt4 = db.Column(db.String(50), nullable=False)
    correct_opt = db.Column(db.Integer, nullable=False)
    
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.id"), nullable=False)
    
class Scores(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time_stamp_of_attempt = db.Column(DateTime, default=func.now())
    
    user_answers = db.Column(db.Text, nullable=False)
    correct_answers = db.Column(db.Text, nullable=False)
    
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapter.id"), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subject.id"), nullable=False)

