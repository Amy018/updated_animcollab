from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from extensions import db
from models import User
import os


app = Flask(__name__)


app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads/public'
app.config['PRIVATE_FOLDER'] = 'static/uploads/private'


os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PRIVATE_FOLDER'], exist_ok=True)


db.init_app(app)


with app.app_context():
    db.create_all()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = generate_password_hash(request.form['password'])

        if User.query.filter_by(email=email).first():
            flash('Email already exists!')
            return redirect(url_for('signup'))

        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully! Please log in.')
        return redirect(url_for('login'))

    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['user_password'] = request.form['password']  
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password')
            return redirect(url_for('login'))

    return render_template('login.html')


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please log in first')
        return redirect(url_for('login'))

    username = session.get('username', 'User')
    return render_template('dashboard.html', username=username)


@app.route('/explore')
def explore():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('explore.html')


@app.route('/create')
def create():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('create.html')


@app.route('/collaborate')
def collaborate():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('collaborate.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out')
    return redirect(url_for('home'))


@app.route('/save_animation', methods=['POST'])
def save_animation():
    if 'user_id' not in session:
        return jsonify({"success": False, "error": "Not logged in"})

    file = request.files.get('video')
    if not file:
        return jsonify({"success": False, "error": "No file uploaded"})

    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)

    # TODO: Save metadata to DB if needed (user_id, filename, public=True)
    return jsonify({"success": True})

# Save private animation
@app.route('/save_private_animation', methods=['POST'])
def save_private_animation():
    if 'user_id' not in session:
        return jsonify({"success": False, "error": "Not logged in"})

    password = request.form.get('password')
    if not password or password != session.get('user_password'):
        return jsonify({"success": False})

    file = request.files.get('video')
    if not file:
        return jsonify({"success": False})

    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['PRIVATE_FOLDER'], filename)
    file.save(save_path)

    # TODO: Save metadata to DB if needed (user_id, filename, public=False)
    return jsonify({"success": True})

# ---------------- Run App ----------------
if __name__ == '__main__':
    app.run(debug=True)