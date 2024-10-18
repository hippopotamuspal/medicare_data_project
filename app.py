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

# Route to the Average Covered Charge
@app.route("/avg_covered_charge/<state>")
def avg_covered_charge(state):
    cov_charge = pd.read_sql("SELECT * FROM medicare_data", engine)
    cov_charge_grouped = cov_charge.loc[(cov_charge["state"] == state),:]
    return jsonify(cov_charge_grouped["avg_covered_charge"].tolist())

# Route to the Average Covered Charge
@app.route("/avg_total_payment/<state>")
def avg_total_payment(state):
    total_payment = pd.read_sql("SELECT * FROM medicare_data", engine)
    total_payment_grouped = total_payment.loc[(total_payment["state"] == state),:]
    return jsonify(total_payment_grouped["avg_total_payment"].tolist())

# Route to the Average Medicare Payment
@app.route("/avg_medicare_payment/<state>")
def avg_medicare_payment(state):
    avg_medicare = pd.read_sql("SELECT * FROM medicare_data", engine)
    avg_medicare_grouped = avg_medicare.loc[(avg_medicare["state"] == state),:]
    return jsonify(avg_medicare_grouped["avg_medicare_payment"].tolist())

# Route to the Average Out of Pocket
@app.route("/avg_oop/<state>")
def avg_oop(state):
    avg_oop = pd.read_sql("SELECT * FROM medicare_data", engine)
    avg_oop_grouped = avg_oop.loc[(avg_oop["state"] == state),:]
    return jsonify(avg_oop_grouped["avg_oop"].tolist())

# Run the Application
if __name__ == '__main__':
    app.run(debug=True)