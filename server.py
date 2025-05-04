from flask import Flask,session
from flask import render_template
from flask import Response, request, jsonify
from datetime import datetime
import uuid
import os
import json

app = Flask(__name__)
app.secret_key = 'secret_key' 

# Dictionary to store flower selections
current_selections = {
    'focal': None,
    'secondary': None,
    'filler': None,
    'greens': None,
    'color_theme': None
}
canvas_flowers = []
MAX_CHECKS = 3


# ROUTES
@app.route('/')
def default():
    session['user_id'] = str(uuid.uuid4())  # Create a unique ID for each session
    session['page_visits'] = {}  # To track timestamps
    return render_template('home.html')


def is_bouquet_valid(selections):
    # replicate your client‐side logic here
    types = ["focal", "secondary", "filler", "greens"]
    if not selections:
        return False
    for t in types:
        if t not in selections or selections[t] == None or selections[t][1] != t:
            return False
    return True


@app.route("/check_bouquet", methods=["POST"])
def check_bouquet():
    data = request.get_json() or {}
    selections = data.get("selections", {})
    valid = is_bouquet_valid(selections)

    if 'attempts_used' not in session:
        session['attempts_used'] = 0
    session['attempts_used'] += 1

    if valid:
        attempts = session['attempts_used']
        score = max(4 - (attempts - 1), 0)  # e.g. 3 if second try
        session['assemble_score'] = score
        session['attempts_used'] = 0  # reset

    return jsonify({
        "hasError": not valid,
        "remaining": max(0, 4 - session['attempts_used'])  # optional
    })

@app.route('/lessons')
def lessons():
    return render_template('lessons.html')


@app.route('/overview')
def overview():
    return render_template('overview.html')


@app.route('/focal_secondary')
def focal_secondary():
    return render_template('focal_secondary.html')


@app.route('/cyu_focal_secondary')
def cyu_focal_secondary():
    return render_template('cyu_focal_secondary.html')


@app.route('/get_progress', methods=['GET'])
def get_progress():
    progress = session.get('drop_data', {'drop-area-1': [], 'drop-area-2': []})
    dropped_ids = progress['drop-area-1'] + progress['drop-area-2']

    all_items = {
        'focals': ["focal1", "focal2", "focal3", "focal4", "focal5", "focal6"],
        'secondaries': ["secondary1", "secondary2", "secondary3", "secondary4", "secondary5", "secondary6"]
    }

    remaining_focals = [id for id in all_items['focals'] if id not in dropped_ids]
    remaining_secondaries = [id for id in all_items['secondaries'] if id not in dropped_ids]

    return jsonify(progress)
    #return jsonify({"remaining_focals": remaining_focals, "remaining_secondaries": remaining_secondaries})


@app.route('/save_progress', methods=['POST'])
def save_progress():
    drop_data = request.get_json()
    if drop_data:
        session['drop_data'] = drop_data
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "error", "message": "No data received"}), 400


@app.route('/assemble')
def assemble():
    global canvas_flowers
    return render_template(
        'assemble.html',
        current_selections=current_selections,
        canvas_flowers=canvas_flowers,
        hasError = False,
        remaining = MAX_CHECKS
    )

@app.route('/update_canvas', methods=['POST'])
def update_canvas():
    global canvas_flowers
    data = request.get_json()

    # Try to update an existing flower
    found = False
    for f in canvas_flowers:
        if f['id'] == data['id']:
            f.update(data)
            found = True
            break

    if not found:
        canvas_flowers.append(data)

    session['canvas_flowers'] = canvas_flowers
    return jsonify(canvas_flowers=canvas_flowers)


@app.route("/delete_canvas", methods=["POST"])
def delete_canvas():
    data = request.get_json()
    global canvas_flowers
    canvas_flowers = [f for f in canvas_flowers if f["id"] != data["id"]]
    return jsonify(canvas_flowers=canvas_flowers)

@app.route('/final')
def final():
    # Quiz score (already tracked)
    quiz_score = 0
    if session.get('quiz1_correct'):
        quiz_score += 1
    if session.get('quiz2_q1_correct'):
        quiz_score += 1
    if session.get('quiz2_q2_correct'):
        quiz_score += 1
    quiz_total = 3

    # Assemble score (newly tracked)
    bouquet_score = session.get('assemble_score', 0)
    bouquet_total = 4

    total_score = quiz_score + bouquet_score
    total_possible = quiz_total + bouquet_total

    return render_template(
        'final.html',
        total_score=total_score,
        quiz_score=quiz_score,
        quiz_total=quiz_total,
        bouquet_score=bouquet_score,
        bouquet_total=bouquet_total,
        current_selections=session.get('current_selections', {}),
        canvas_flowers=session.get('canvas_flowers', [])
    )

@app.route('/fillers')
def fillers():
    return render_template('fillers.html')


@app.route('/cyu_fillers')
def cyu_fillers():
    return render_template('cyu_fillers.html')
@app.route('/greens')
def greens():
    return render_template('greens.html')


@app.route('/color_harmony')
def color_harmony():
    return render_template('color_harmony.html')
@app.route('/cyu_color_harmony')
def cyu_color_harmony():
    return render_template('cyu_color_harmony.html')

@app.route('/textures')
def textures():
    return render_template('textures.html')

@app.route('/cyu_textures')
def cyu_textures():
    return render_template('cyu_textures.html')

@app.route('/buildit_quiz1')
def buildit_quiz1():
    return render_template('buildit_quiz1.html')

@app.route('/buildit_quiz2')
def buildit_quiz2():
    return render_template('buildit_quiz2.html')



# AJAX FUNCTIONS
@app.route('/save_flower', methods=['POST'])
def save_flower():
    data = request.get_json()
    # Save the flower name in the build_it_flowers dictionary
    current_selections[ data['dropZoneType']] = (data['flowerName'], data['flowerType'], data['imageURL'])
    return jsonify(current_selections=current_selections) 


@app.route('/clear_flower', methods=['POST'])
def clear_flower():
    data = request.get_json()
    flower_type = data['flowerType']  # This comes from data-type in HTML
    
    # Clear the flower from build_it_flowers
    current_selections[flower_type] = None
    return jsonify(current_selections=current_selections) 


@app.route('/save_theme', methods=['POST'])
def save_theme():
    global color_theme
    data = request.get_json()
    # Grab the submitted theme (or default to empty)
    color_theme = data.get('color_theme', '').strip()
    current_selections["color_theme"] = color_theme
    return jsonify(current_selections=current_selections)

@app.route('/submit_assemble_score', methods=['POST'])
def submit_assemble_score():
    data = request.get_json()
    session['assemble_score'] = data.get('score', 0)
    return jsonify(success=True)

@app.route('/submit_quiz1', methods=['POST'])
def submit_quiz1():
    data = request.get_json()
    session['quiz1_correct'] = data.get('correct', False)
    return jsonify(success=True)

@app.route('/submit_quiz2', methods=['POST'])
def submit_quiz2():
    data = request.get_json()
    session['quiz2_q1_correct'] = data.get('q1_correct', False)
    session['quiz2_q2_correct'] = data.get('q2_correct', False)
    return jsonify(success=True)


if __name__ == '__main__':
   app.run(debug = True, port=5001)




