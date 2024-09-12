from models import db, bcrypt
from flask_login import UserMixin

# Association table
user_task_association = db.Table('user_task',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('task_id', db.Integer, db.ForeignKey('task.id'), primary_key=True)
)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    tasks = db.relationship('Task', secondary=user_task_association, backref=db.backref('users', lazy='dynamic'))

    def __init__(self, login, password):
        self.login = login
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)