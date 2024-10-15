from flask import Flask, jsonify, Response
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.automap import automap_base
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Replace with your actual DATABASE_URL
DATABASE_URL = os.getenv('DATABASE_URL')

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Use automap to reflect the existing database schema
Base = automap_base()
Base.prepare(engine, reflect=True)

# Access the mapped class for the medicare_data table
MedicareData = Base.classes.medicare_data

Session = sessionmaker(bind=engine)
session = Session()

def generate_data(): 
    yield '['  # Start JSON array
    result = session.execute(text("SELECT * FROM medicare_data"))
    first_row = True
    for row in result:
        print(row)
        if not first_row:
            yield ','  # Separate each JSON object with a comma
        first_row = False
        yield json.dumps(dict(row._mapping))
    yield ']'  # End JSON array

@app.route('/')
def index():
    return "Hello, Flask is running!"

@app.route('/data')
def stream_data():
    return Response(generate_data(), content_type='application/json')
# def get_data():
#     try:
#         # Use the ORM to get all records from medicare_data
#         results = session.query(MedicareData).all()
#         data = [row.__dict__ for row in results]
#         # Remove SQLAlchemy's internal attributes
#         for item in data:
#             item.pop('_sa_instance_state', None)
#         return {'data': data}
#     except Exception as e:
#         return {'error': str(e)}

if __name__ == '__main__':
    app.run(debug=True)