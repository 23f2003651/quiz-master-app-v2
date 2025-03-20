from flask import Flask
from extensions import db, security, cache
from create_initial_data import create_data
import views
import resources
from flask_caching import Cache
from celery_dir.celery_factory import celery_init_app
import flask_excel as excel

def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = 'this_should-be*secret'
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.db"
    app.config['SECURITY_PASSWORD_SALT'] = 'salty-password'

    # Cache Configuration
    app.config['CACHE_TYPE'] = "RedisCache"  
    app.config['CACHE_DEFAULT_TIMEOUT'] = 30
    app.config['CACHE_REDIS_HOST'] = "localhost"
    app.config['CACHE_REDIS_PORT'] = 6379
    app.config['CACHE_REDIS_DB'] = 0

    # Initialize extensions
    cache.init_app(app)
    db.init_app(app)
    excel.init_excel(app)

    with app.app_context():
        from models import User, Role
        from flask_security import SQLAlchemyUserDatastore

        user_datastore = SQLAlchemyUserDatastore(db, User, Role)
        security.init_app(app, user_datastore)

        db.create_all()
        create_data(user_datastore)

    views.create_view(app, user_datastore)
    
    resources.api.init_app(app)

    app.config["WTF_CSRF_CHECK_DEFAULT"] = False
    app.config["SECURITY_CSRF_PROTECT_MECHANISHMS"] = []
    app.config["SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS"] = True

    return app

app = create_app()
celery_app = celery_init_app(app)

celery_app.conf.update(app.config)

if __name__ == "__main__":
    app.run(debug=True, port=5500)
