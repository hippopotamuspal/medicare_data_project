CREATE TABLE medicare_data (
	id serial PRIMARY KEY,
	state VARCHAR(4) NOT NULL,
	county VARCHAR(40) NOT NULL,
	zip INT NOT NULL,
	c_type VARCHAR(6) NOT NULL,
	mdc_code VARCHAR(10) NOT NULL,
	mdc_desc VARCHAR(100) NOT NULL,
	discharges INT,
	avg_covered_charge FLOAT NOT NULL,
	avg_total_payment FLOAT NOT NULL,
	avg_medicare_payment FLOAT NOT NULL,
	avg_oop FLOAT NOT NULL
);

CREATE TABLE stats_table (
	id serial PRIMARY KEY,
	state VARCHAR(4) NOT NULL,
	total_discharges INT NOT NULL,
	avg_oop FLOAT NOT NULL,
	avg_insured FLOAT NOT NULL
);