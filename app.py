# Import the dependencies.
import os
import pandas as pd
import numpy as np
import sqlalchemy
import math
import json
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect, text
from flask import Flask, jsonify, render_template, Response
from dotenv import load_dotenv

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################

# Load environment variables from .env
load_dotenv()

# Replace with your actual DATABASE_URL
DATABASE_URL = os.getenv('DATABASE_URL')

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Additional Engine Configs
conn = engine.connect()
session = Session(engine)

#################################################
# Flask Routes
#################################################

# Defining the homepage
@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

# Defining the route to the state pages
@app.route("/state_list")
def states():
    #Running a query to find all unique states and return a list of them
    states = pd.read_sql("SELECT state FROM medicare_data", engine)
    state_list = states['state'].unique()
    state_list = state_list.tolist()
    state_list = sorted(state_list)
    return jsonify(state_list)

# Route to National Stats
@app.route("/national_stats")
def national_stats():
    # Query to fetch only relevant columns for the given state
    query = """
        SELECT * 
        FROM stats_table 
    """
    # Execute query and store result in a DataFrame
    national_stats_data = pd.read_sql(query, engine)
    
    # Convert DataFrame to a list of dictionaries
    result = national_stats_data.to_dict(orient="records")
    
    # Return the result as a JSON response
    return jsonify(result)

# Route to the StateDB
@app.route("/db_info/<state>")
def db_info(state):
    
    query = """
        SELECT zip, mdc_code, avg_covered_charge, avg_total_payment, avg_medicare_payment, avg_oop
        FROM medicare_data 
        WHERE state = %s
    """
    # Execute query and store result in a DataFrame
    state_data = pd.read_sql(query, engine, params=(state,))
    
    # Convert DataFrame to a list of dictionaries
    result = state_data.to_dict(orient="records")
    
    # Return the result as a JSON response
    return jsonify(result)

# Run the Application
if __name__ == '__main__':
    app.run(debug=True)


# # Route to the Average Covered Charge
# @app.route("/avg_covered_charge/<state>")
# def avg_covered_charge(state):
#     # Query to fetch only relevant columns for the given state
#     query = """
#         SELECT zip, mdc_code, avg_covered_charge 
#         FROM medicare_data 
#         WHERE state = %s
#     """
#     # Execute query and store result in a DataFrame
#     avg_covered_charge_data = pd.read_sql(query, engine, params=(state,))
    
#     # Convert DataFrame to a list of dictionaries
#     result = avg_covered_charge_data.to_dict(orient="records")
    
#     # Return the result as a JSON response
#     return jsonify(result)


# # Route to the Average Total Payment
# @app.route("/avg_total_payment/<state>")
# def avg_total_payment(state):
#     # Query to fetch only relevant columns for the given state
#     query = """
#         SELECT zip, mdc_code, avg_total_payment 
#         FROM medicare_data 
#         WHERE state = %s
#     """
#     # Execute query and store result in a DataFrame
#     avg_total_payment_data = pd.read_sql(query, engine, params=(state,))
    
#     # Convert DataFrame to a list of dictionaries
#     result = avg_total_payment_data.to_dict(orient="records")
    
#     # Return the result as a JSON response
#     return jsonify(result)


# # Route to the Average Medicare Payment
# @app.route("/avg_medicare_payment/<state>")
# def avg_medicare_payment(state):
#     # Query to fetch only relevant columns for the given state
#     query = """
#         SELECT zip, mdc_code, avg_medicare_payment 
#         FROM medicare_data 
#         WHERE state = %s
#     """
#     # Execute query and store result in a DataFrame
#     avg_medicare_payment_data = pd.read_sql(query, engine, params=(state,))
    
#     # Convert DataFrame to a list of dictionaries
#     result = avg_medicare_payment_data.to_dict(orient="records")
    
#     # Return the result as a JSON response
#     return jsonify(result)

# # Route to the Average Out of Pocket
# @app.route("/avg_oop/<state>")
# def avg_oop(state):
#     # Query to fetch only relevant columns for the given state
#     query = """
#         SELECT zip, mdc_code, avg_oop 
#         FROM medicare_data 
#         WHERE state = %s
#     """
#     # Execute query and store result in a DataFrame
#     avg_oop_data = pd.read_sql(query, engine, params=(state,))
    
#     # Convert DataFrame to a list of dictionaries
#     result = avg_oop_data.to_dict(orient="records")
    
#     # Return the result as a JSON response
#     return jsonify(result)

# # Run the Application
# if __name__ == '__main__':
#     app.run(debug=True)