from flask import Flask
from flask import render_template
from flask import Response, request, jsonify
import os
import json

app = Flask(__name__)

# Dictionary to store flower selections
current_flowers = {
    'focal': None,
    'secondary': None,
    'filler': None,
    'greens': None
}

# ROUTES
@app.route('/home')
def hello():
    return render_template('home.html') 


@app.route('/')
def hello_world():
   return render_template('home.html')   

@app.route('/assemble')
def assemble():
    return render_template('assemble.html', current_flowers=current_flowers)

# skeleton code from hw 5
@app.route('/learn/<index>')
def hello_name(name=None):
    return render_template('hello_name.html', name=name) 


@app.route('/people')
def people():
    return render_template('people.html', data=data)  


# AJAX FUNCTIONS
@app.route('/save_flower', methods=['POST'])
def save_flower():
    data = request.get_json()
    # Save the flower name in the build_it_flowers dictionary
    current_flowers[ data['dropZoneType']] = (data['flowerName'], data['flowerType'], data['imageURL'])
    return jsonify(current_flowers=current_flowers) 

@app.route('/clear_flower', methods=['POST'])
def clear_flower():
    data = request.get_json()
    flower_type = data['flowerType']  # This comes from data-type in HTML
    
    # Clear the flower from build_it_flowers
    current_flowers[flower_type] = None
    return jsonify(current_flowers=current_flowers) 

if __name__ == '__main__':
   app.run(debug = True, port=5001)




