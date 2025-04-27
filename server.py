from flask import Flask, session
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

# ROUTES
@app.route('/')
def default():
    session['user_id'] = str(uuid.uuid4())  # Create a unique ID for each session
    session['page_visits'] = {}  # To track timestamps
    return render_template('home.html')


@app.route('/lessons')
def lessons():
    return render_template('lessons.html')


@app.route('/overview')
def overview():
    return render_template('overview.html')


@app.route('/focal_secondary')
def focal_secondary():
    return render_template('focal_secondary.html')


@app.route('/assemble')
def assemble():
    global canvas_flowers
    return render_template(
        'assemble.html',
        current_selections=current_selections,
        canvas_flowers=canvas_flowers
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

    return jsonify(canvas_flowers=canvas_flowers)

@app.route("/delete_canvas", methods=["POST"])
def delete_canvas():
    data = request.get_json()
    global canvas_flowers
    canvas_flowers = [f for f in canvas_flowers if f["id"] != data["id"]]
    return jsonify(canvas_flowers=canvas_flowers)

@app.route('/final')
def final():
    return render_template('final.html', canvas_flowers=canvas_flowers)

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


if __name__ == '__main__':
   app.run(debug = True, port=5001)




