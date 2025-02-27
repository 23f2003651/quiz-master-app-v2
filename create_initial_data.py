from flask_security.datastore import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extensions import db

def create_data(user_datastore:SQLAlchemyUserDatastore):
    print("###Creating Data###")

    # create roles
    admin_role = user_datastore.find_or_create_role(name='admin', description="Admin")
    user_role = user_datastore.find_or_create_role(name='user', description="User")

    # create user data
    if not user_datastore.find_user(email="admin@gmail.com"):
        admin_user = user_datastore.create_user(email="admin@gmail.com", password=hash_password("admin"), username ="Admin", qualification="Admin", active=True, roles=[admin_role])
        admin_user.role_id = admin_role.id

    if not user_datastore.find_user(email="user@gmail.com"):
        user_user = user_datastore.create_user(email="user@gmail.com", password=hash_password("user"), username="User", qualification="User", active=False, roles=[user_role])
        user_user.role_id = user_role.id

    db.session.commit()