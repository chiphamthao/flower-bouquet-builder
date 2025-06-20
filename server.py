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
MAX_CHECKS = 4


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
    global MAX_CHECKS

    data = request.get_json() or {}

    selections = data.get("selections", {})
    valid = is_bouquet_valid(selections)

    if not valid:
        MAX_CHECKS = max(0, MAX_CHECKS - 1)

    return jsonify({
        "hasError": not valid,
        "remaining": MAX_CHECKS
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


@app.route('/refresh', methods=['POST'])
def refresh():
    progress = {
        "drop-area-1": [],
        "drop-area-2": []
    }
    return jsonify(progress)


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


@app.route('/save_progress', methods=['POST'])
def save_progress():
    drop_data = request.get_json()
    if drop_data:
        session['drop_data'] = drop_data
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "error", "message": "No data received"}), 400

@app.route('/save_progress_textures', methods=['POST'])
def save_progress_textures():
    data = request.get_json()
    session['texture_selection'] = data.get('selected', [])
    session['texture_feedback'] = data.get('feedback', "")
    return jsonify(status="saved")

@app.route('/get_progress_textures', methods=['GET'])
def get_progress_textures():
    saved = session.get('texture_selection', [])
    feedback = session.get('texture_feedback', "")
    return jsonify(selected=saved, feedback=feedback)


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

    # compute bouquet score based on correct selections
    types = ["focal", "secondary", "filler", "greens"]
    bouquet_score = 0
    for t in types:
        if current_selections.get(t) and current_selections[t][1] == t:
            bouquet_score += 1
    
    return render_template(
        'final.html',
        total_score=quiz_score + bouquet_score,
        quiz_score=quiz_score,
        quiz_total=quiz_total,
        bouquet_score=bouquet_score,
        bouquet_total=4,
        current_selections= current_selections,
        canvas_flowers=canvas_flowers)

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

@app.route('/save_progress_fillers', methods=['POST'])
def save_progress_fillers():
    data = request.get_json()
    session['correctCount'] = data.get('correctCount', 0)
    session['hiddenItems'] = data.get('hiddenItems', [])
    return jsonify(status="success")

@app.route('/get_progress_fillers', methods=['GET'])
def get_progress_fillers():
    return jsonify(
        correctCount=session.get('correctCount', 0),
        hiddenItems=session.get('hiddenItems', [])
    )

@app.route('/save_mcq_color_harmony', methods=['POST'])
def save_mcq():
    data = request.get_json()
    session['mcq_answer'] = data.get('answer')
    return jsonify(status='success')
@app.route('/get_mcq_color_harmony')
def get_mcq():
    return jsonify(answer=session.get('mcq_answer'))



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

@app.route('/save_progress_quiz1', methods=['POST'])
def save_progress_quiz1():
    data = request.get_json()
    session['quiz1_saved_answer'] = data.get('answer')
    session['quiz1_correct'] = data.get('correct')
    return jsonify(success=True)

@app.route('/get_progress_quiz1')
def get_progress_quiz1():
    return jsonify(
        answer=session.get('quiz1_saved_answer'),
        correct=session.get('quiz1_correct')
    )

@app.route('/save_progress_quiz2', methods=['POST'])
def save_progress_quiz2():
    data = request.get_json()
    session['quiz2_saved'] = {
        'row1': data.get('row1'),
        'row2': data.get('row2'),
        'q1_correct': data.get('q1_correct'),
        'q2_correct': data.get('q2_correct')
    }
    session['quiz2_q1_correct'] = data.get('q1_correct')
    session['quiz2_q2_correct'] = data.get('q2_correct')
    return jsonify(success=True)

@app.route('/get_progress_quiz2')
def get_progress_quiz2():
    return jsonify(session.get('quiz2_saved', {}))


if __name__ == '__main__':
   app.run(debug = True, port=5001)




