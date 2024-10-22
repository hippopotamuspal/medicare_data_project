# The Cost of Healthcare in the United States
### Quinn Daley - Nicholas Fussy - Joseph Kennedy - William Levine

## Overview
This repository contains the necessary resources to run a webpage which visualizes data from Medicare Inpatient Hospitals in 2022. It has information for location, service/diagnosis type, total discharges, out-of-pocket costs, and amounts covered by Medicare. The webpage aims to answer the following questions about the data:
- How does healthcare cost vary by state?
- What are the top 10 most frequent, most expensive, or most insured diagnoses in any given US State?
- For a given location, what proportion of a healthcare costs are paid by Medicare, and what proportion are paid by the patient? How much of the total cost do both combined cover?

To answer these questions, the site shows a choropleth of the US, which can be filtered by the user to show average out-of-pocket payments, average medicare payments, and total inpatient discharges per state. A darker color on the choropleth indicates a higher value for the metric. A bar chart, which can be filtered by the same metrics as well as by state, shows the top medical conditions or services in that state for the selected metric. A pie chart shows the average proportion of costs paid by the patient and by Medicare for that state, and how much of the total cover charge these payments account for.

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

### Data Cleaning

After downloading the original dataset, titled `MUP_INP_RY24_P03_V10_DY22_PrvSvc.CSV` and stored in the `Resources` folder, we cleaned the data using Python and pandas. This process is documented in the Jupyter Notebook file titled `medicare_analysis.ipynb`. To clean this data, we dropped unnecessary columns, renamed the kept columns, calculated and created a column for the average out-of-pocket costs, and ensured data types were properly set for each column. The original data set had Diagnosis Related Group (DRG) codes; we chose to use Major Diagnostic Category (MDC) codes instead, as there are fewer of them and they are more easily understood by those outside of the medical field. Each DRG code has a corresponding MDC code; they were mapped using the file `DRG_to_MDC_Crosswalk.xlsx` found in the `Resources` folder, and then merged to the cleaned data set in pandas. This final dataframe was then exported as a .csv titled `cleanedmedicaredata.csv`, found in the main repository.

To create a data frame which gives average stats per state, we imported this cleaned csv into pandas. We ran a `groupby()` function on the state column to give the average number of total discharges, average out-of-pocket costs, and average amounts paid by Medicare in each state. These commands can be found in `stats_grouping.ipynb`, held in the main repository. This dataframe was then exported as `stats_table.csv`.

### Back End

After writing the table schema, we went through the process outlined in the Instructions section above. An Entity Relationship Diagram (ERD) of the database tables can be found in the `ERD.png` file, which gives a quick visual reference for what columns are in each table and their respective data types. After the data was imported into a PostgreSQL database in pgAdmin 4, we could use SQLAlchemy in our `app.py` file to send the data to a Flask API, with different routes available for different queries on the data. This `app.py` can be found in the main repository.

### Front End

We used JavaScript and HTML to build the site which allows the user to interact with the data set. The HTML file, titled `index.html`, can be found in the `templates` folder. The JavaScript file, titled `app.js`, can be found in the `static` folder.

### New Library - Bootstrap
[INSERT BOOTSTRAP DISCUSSION HERE]

### Data Ethics
The dataset used for this project was already aggregated, ensuring that no personally identifiable information was included. To maintain transparency, all data cleaning steps, assumptions, and transformations have been documented and shared with lecturers. This ensures the reproducibility of the analysis and holds us accountable for any decisions made based on this work. The findings from this analysis are intended solely for use by the Data Analytics and Visualization Bootcamp at the University of Minnesota.

## Sources
Original data set: https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/medicare-inpatient-hospitals-by-provider-and-service/data

DRG-to-MDC code reference: https://www.cms.gov/icd10m/version372-fullcode-cms/fullcode_cms/P0002.html

US States GEOJSON: https://github.com/PublicaMundi/MappingAPI/blob/master/data/geojson/us-states.json
