from flask import Flask
from flask import render_template
from flask import Response, request, jsonify
import os
import json

app = Flask(__name__)

# Dictionary to store flower selections
current_selections = {
    'focal': None,
    'secondary': None,
    'filler': None,
    'greens': None,
    'color_theme': None
}

# ROUTES
@app.route('/')
def default():
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
    return render_template('assemble.html', current_selections=current_selections)

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




