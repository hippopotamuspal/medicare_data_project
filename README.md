# The Cost of Healthcare in the United States
## Navigation
## Instructions
The following libraries must be installed to run the code in this repository:

Python:
- Flask
- SQLAlchemy
- Pandas
- Psycopg2

JavaScript/CSS:
- Bootstrap
- Leaflet.js
- Leaflet Choropleth Plugin
- D3.js
- Plotly.js

A PostgreSQL platform such as pgAdmin4 must also be installed and set up.

After cloning the repository, add a `.env` file to your local repository. In it, paste the following line, edited to include your specific credentials and information:

`DATABASE_URL=postgresql+psycopg2://<username>:<password>@<hostname>/medicareData_db`

Leave the database name as `medicareData_db`.

Create a database in your PostgreSQL platform with the name `medicareData_db`. **Be careful to match case exactly as written here!**

Using the query tool for the newly created `medicareData_db` database, paste the schemas from the repository file titled `medicareData_db_schema.sql`. Run the query. This will create two tables: one titled `medicare_data` and one titled `stats_table`.

Into `medicare_data`, import the file titled `cleanedmedicaredata.csv`. In the **options** menu, make sure **header** is selected; in the **columns** menu, deselect the `id` column. The `id` column is automatically created as a serial integer when the data is imported and does not exist in the .csv file.

For `stats_table`, import the file titled `stats_table.csv`. Follow the same procedure as above, ensuring **header** is selected and the `id` column is deselected.

Open an anaconda prompt or your python environment of choice. Change your directory to your local repository, and run the command `python app.py`. In your browser, paste the URL that prints in the python environment. The visualization tool should load and allow you to interact with the data.



## Process
## Sources
