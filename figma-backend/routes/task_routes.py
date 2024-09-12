from flask import Blueprint, jsonify, request
from models import db
from models.task import Status, Task
from models.user import User
from flask_login import login_required, current_user


task_bp = Blueprint('task_bp', __name__)

@task_bp.route("/new", methods=['POST'])
def new_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    owner_id= data.get('owner_id')

    if not title or not description:
        return jsonify({'error': 'Title and description are required!'}), 400

    task = Task(title=title, description=description, owner_id=owner_id)
    db.session.add(task)
    db.session.commit()

    # Return the created task as JSON
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'owner_id': task.owner_id
    }), 201

@task_bp.route("/<int:task_id>/edit", methods=['POST'])
# @login_required
def edit_task(task_id):
    task = Task.query.get_or_404(task_id)

    # Ensure the current user is assigned to the task or is authorized to edit it
    # if current_user not in task.users and current_user.id != task.owner_id:
    #     return jsonify({'error': 'You are not authorized to edit this task'}), 403

    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    
    db.session.commit()

    return jsonify({'message': 'Task updated successfully!'}), 200

@task_bp.route("/<int:task_id>/update_status", methods=['POST'])
# @login_required
def update_task_status(task_id):
    task = Task.query.get_or_404(task_id)

    # if current_user not in task.users and current_user.id != task.owner_id:
    #     return jsonify({'error': 'You are not authorized to update the status of this task'}), 403

    data = request.get_json()
    status_code = data.get('status')

    if status_code not in Status.code:
        return jsonify({'error': 'Invalid status code'}), 400

    task.status = Status.code[status_code]
    
    db.session.commit()

    return jsonify({'message': 'Task status updated successfully!', 'status': task.status}), 200


@task_bp.route("/<int:task_id>/delete", methods=['POST'])
def delete_task(task_id):
    data = request.get_json()  # Obtém o corpo da requisição JSON
    user_id = data.get('user_id')  # Obtém o ID do usuário do corpo da requisição

    task = Task.query.get_or_404(task_id)

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    # Verifica se o usuário está autorizado a excluir a tarefa
    if user_id != task.owner_id:
        return jsonify({'error': 'You are not authorized to delete this task'}), 403

    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted successfully!'}), 200

@task_bp.route("/<int:task_id>/assign", methods=['POST'])
@login_required
def assign_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    user_id = data.get('user_id')
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if task not in user.tasks:
        user.tasks.append(task)
        db.session.commit()
        return jsonify({'message': 'Task assigned to user successfully!'}), 200
    else:
        return jsonify({'warning': 'Task is already assigned to this user'}), 409

@task_bp.route("/<int:task_id>/deassign", methods=['POST'])
@login_required
def deassign_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    user_id = data.get('user_id')
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if task in user.tasks:
        user.tasks.remove(task)
        db.session.commit()
        return jsonify({'message': 'Task deassigned from user successfully!'}), 200
    else:
        return jsonify({'warning': 'Task is not assigned to this user'}), 409

@task_bp.route("/", methods=['GET'])
def get_all_tasks():
    # Fetch all tasks from the database
    tasks = Task.query.all()

    # Return tasks data
    task_list = [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "owner_id": task.owner_id
        }
        for task in tasks
    ]
    
    return jsonify(task_list), 200

@task_bp.route("/<int:task_id>", methods=['GET'])
def get_task_info(task_id):
    task = Task.query.get_or_404(task_id)

    users = [
        {
            "id": user.id,
            "login": user.login
        }
        for user in task.users
    ]

    task_info = {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "owner_id": task.owner_id,
        "assigned_users": users
    }

    return jsonify(task_info), 200