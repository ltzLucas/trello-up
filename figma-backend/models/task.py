from models import db

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pendente')
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) 

    def __init__(self, title, description, owner_id):
        self.title = title
        self.description = description
        self.status = Status.code[0]  # Default to "Pendente"
        self.owner_id = owner_id

class Status:
    code = {
        0: "Pendente",
        1: "Em andamento",
        2: "Concluída"
    }