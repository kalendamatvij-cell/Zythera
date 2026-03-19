from flask import Flask, render_template, request, redirect, url_for, jsonify, flash, abort
from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # для flash-повідомлень

auth = HTTPBasicAuth()

# Налаштування користувача для адмін-панелі
users = {
    "admin": generate_password_hash("admin")
}

@auth.verify_password
def verify_password(username, password):
    if username in users and check_password_hash(users.get(username), password):
        return username
    return None

# Файли даних
ADMIN_DATA_FILE = 'admin_counts.json'
APPLICATIONS_FILE = 'applications.json'
SERVERS_FILE = 'servers.json'

# Дані за замовчуванням для адмінів
DEFAULT_ADMINS = {
    "Owner": "1/1",
    "Правая рука создателя сервера": "0/1",
    "Зам.создателя сервера": "0/1",
    "Адміністратори": "6/6",
    "Helper": "0/4",
    "Модератори": "0/6"
}

def load_admin_counts():
    if os.path.exists(ADMIN_DATA_FILE):
        with open(ADMIN_DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return DEFAULT_ADMINS

def load_applications():
    if os.path.exists(APPLICATIONS_FILE):
        with open(APPLICATIONS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_applications(apps):
    with open(APPLICATIONS_FILE, 'w', encoding='utf-8') as f:
        json.dump(apps, f, ensure_ascii=False, indent=4)

def load_servers():
    if os.path.exists(SERVERS_FILE):
        with open(SERVERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_servers(servers):
    with open(SERVERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(servers, f, ensure_ascii=False, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/admins')
def get_admins():
    counts = load_admin_counts()
    return jsonify(counts)

@app.route('/apply', methods=['GET'])
def apply_form():
    return render_template('apply.html')

@app.route('/submit_application', methods=['POST'])
def submit_application():
    # Отримуємо всі поля з форми
    minecraft_nick = request.form.get('minecraft_nick')
    real_name = request.form.get('real_name')
    age = request.form.get('age')
    discord = request.form.get('discord')
    minecraft_exp = request.form.get('minecraft_exp')
    server_exp = request.form.get('server_exp')
    reason = request.form.get('reason')
    experience = request.form.get('experience')
    hours_per_day = request.form.get('hours_per_day')
    action_on_violation = request.form.get('action_on_violation')
    rules_knowledge = request.form.get('rules_knowledge')
    ready_to_help = request.form.get('ready_to_help')

    # Проста валідація
    if not all([minecraft_nick, real_name, age, discord, minecraft_exp, server_exp,
                reason, experience, hours_per_day, action_on_violation,
                rules_knowledge, ready_to_help]):
        flash('Будь ласка, заповніть всі поля', 'error')
        return redirect(url_for('apply_form'))

    apps = load_applications()
    new_id = max([app['id'] for app in apps], default=0) + 1
    apps.append({
        'id': new_id,
        'minecraft_nick': minecraft_nick,
        'real_name': real_name,
        'age': age,
        'discord': discord,
        'minecraft_exp': minecraft_exp,
        'server_exp': server_exp,
        'reason': reason,
        'experience': experience,
        'hours_per_day': hours_per_day,
        'action_on_violation': action_on_violation,
        'rules_knowledge': rules_knowledge,
        'ready_to_help': ready_to_help,
        'status': 'pending',
        'created_at': datetime.now().isoformat()
    })
    save_applications(apps)
    flash('Заявку успішно подано! Адміністрація розгляне її найближчим часом.', 'success')
    return redirect(url_for('index'))

@app.route('/admin/applications')
@auth.login_required
def admin_applications():
    apps = load_applications()
    return render_template('admin_applications.html', applications=apps)

@app.route('/admin/application/<int:app_id>')
@auth.login_required
def view_application(app_id):
    apps = load_applications()
    app_data = next((app for app in apps if app['id'] == app_id), None)
    if not app_data:
        abort(404)
    return render_template('application_detail.html', application=app_data)

@app.route('/admin/application/<int:app_id>/<action>', methods=['POST'])
@auth.login_required
def update_application(app_id, action):
    if action not in ['approve', 'reject']:
        return 'Невірна дія', 400
    apps = load_applications()
    for app in apps:
        if app['id'] == app_id:
            app['status'] = 'approved' if action == 'approve' else 'rejected'
            break
    save_applications(apps)
    return redirect(url_for('admin_applications'))

@app.route('/api/servers')
def get_servers():
    servers = load_servers()
    return jsonify(servers)

@app.route('/admin/servers')
@auth.login_required
def admin_servers():
    servers = load_servers()
    return render_template('admin_servers.html', servers=servers)

@app.route('/admin/servers/add', methods=['POST'])
@auth.login_required
def add_server():
    name = request.form.get('name')
    ip = request.form.get('ip')
    description = request.form.get('description', '')
    status = request.form.get('status', 'online')
    
    if not name or not ip:
        flash('Назва та IP обов\'язкові', 'error')
        return redirect(url_for('admin_servers'))
    
    servers = load_servers()
    new_id = max([s['id'] for s in servers], default=0) + 1
    servers.append({
        'id': new_id,
        'name': name,
        'ip': ip,
        'description': description,
        'status': status,
        'created_at': datetime.now().isoformat()
    })
    save_servers(servers)
    flash('Сервер додано успішно', 'success')
    return redirect(url_for('admin_servers'))

@app.route('/admin/servers/<int:server_id>/edit', methods=['POST'])
@auth.login_required
def edit_server(server_id):
    servers = load_servers()
    for server in servers:
        if server['id'] == server_id:
            server['name'] = request.form.get('name', server['name'])
            server['ip'] = request.form.get('ip', server['ip'])
            server['description'] = request.form.get('description', server['description'])
            server['status'] = request.form.get('status', server['status'])
            break
    save_servers(servers)
    flash('Сервер оновлено', 'success')
    return redirect(url_for('admin_servers'))

@app.route('/admin/servers/<int:server_id>/delete', methods=['POST'])
@auth.login_required
def delete_server(server_id):
    servers = load_servers()
    servers = [s for s in servers if s['id'] != server_id]
    save_servers(servers)
    flash('Сервер видалено', 'success')
    return redirect(url_for('admin_servers'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)