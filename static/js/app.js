// NATIONAL CHOROPLETH
// Initialize the map
let map = L.map('nationalChoropleth').setView([37.8, -96], 4);
// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// Global variable to hold GeoJSON layer and legend
let geojsonLayer;
let legend;
// Function to format numbers as currency (USD)
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
// Function to format numbers with commas (for total discharges)
function formatNumberWithCommas(value) {
    return value.toLocaleString();
}
// Function to update the choropleth based on the selected value
function updateChoropleth(selectedValue) {
    // Fetch the GeoJSON data for states
    d3.json('/static/data/us-states.json').then(function(geoData) {
        // Fetch the national stats data
        d3.json('/national_stats').then(function(data) {
            // Get the min and max values for the selected metric
            const values = data.map(d => d[selectedValue]);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            // Prepare the data for the choropleth
            geoData.features.forEach(function(feature) {
                const stateData = data.find(d => d.state === feature.properties.name);
                feature.properties.value = stateData ? stateData[selectedValue] : 0; // Default to 0 if no data found
            });
            // Remove existing layer if it exists
            if (geojsonLayer) {
                map.removeLayer(geojsonLayer);
            }
            // Create a new choropleth layer
            geojsonLayer = L.geoJson(geoData, {
                style: function(feature) {
                    return {
                        fillColor: getColor(feature.properties.value, minValue, maxValue, selectedValue),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: function(feature, layer) {
                    // Format the value as currency for monetary metrics or with commas for total discharges
                    const formattedValue = (selectedValue === 'total_discharges')
                        ? formatNumberWithCommas(feature.properties.value)
                        : formatCurrency(feature.properties.value);
                    layer.bindPopup(feature.properties.name + ': ' + formattedValue);
                }
            }).addTo(map);
            // Update the legend based on the new metric
            updateLegend(minValue, maxValue, selectedValue);
        });
    });
    // Update the description of the choropleth based on the selected option
    let infoText;
    switch (selectedValue) {
        case 'avg_oop':
            infoText = 'Average Out-of-Pocket (OOP) Payment: This represents the average amount paid by patients after Medicare pays their portion.';
            break;
        case 'avg_insured':
            infoText = 'Average Medicare Payment: This represents the average payment that Medicare covers for hospital services.';
            break;
        case 'total_discharges':
            infoText = 'Total Number of Discharges: This shows the total count of hospital discharges for all MDC codes across the United States.';
            break;
        default:
            infoText = 'Definition body.';
            break;
    }

    // Update the description's content
    document.getElementById('infoText').innerText = infoText;
}

// Function to get a color based on the value using a gradient
function getColor(value, minValue, maxValue, selectedMetric) {
    // Define color scales based on the metric
    let colorScale;
    if (selectedMetric === 'total_discharges') {
        // Link Blue to Deep Sapphire
        colorScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range(['#D9E4F5', '#082567']);
    } else if (selectedMetric === 'avg_oop') {
        // Link Blue to Deep Sapphire
        colorScale = d3.scaleLinear()
            .domain([minValue, 4000])
            .range(['#D9E4F5', '#082567']);
    } else if (selectedMetric === 'avg_insured') {
        // Link Blue to Deep Sapphire
        colorScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range(['#D9E4F5', '#082567']);
    }
    // Return interpolated color
    return colorScale(value);
}
// Function to update the dynamic legend with a title
function updateLegend(minValue, maxValue, selectedMetric) {
    // Cap the avg_oop at 4000 due to outliers
    if (selectedMetric === 'avg_oop') {
        maxValue = 4000;
    }
    // Remove the existing legend if it exists
    if (legend) {
        map.removeControl(legend);
    }
    // Create a new legend
    legend = L.control({ position: 'bottomright' });
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        // Style the legend box with a white background and padding
        div.style.backgroundColor = 'white';  
        div.style.padding = '10px';           
        div.style.border = '2px solid black'; 
        div.style.borderRadius = '5px';       
        // Add a title based on the selected metric
        let title = '';
        if (selectedMetric === 'total_discharges') {
            title = 'Total Discharges';
        } else if (selectedMetric === 'avg_oop') {
            title = 'Average Out-of-Pocket Payment';
        } else if (selectedMetric === 'avg_insured') {
            title = 'Average Medicare Payment';
        }
        // Add the title at the top of the legend
        div.innerHTML = `<strong>${title}</strong><br><br>`;
        // Divide the range into three intervals 
        const grades = [minValue, (minValue + maxValue) / 2, maxValue]; 
        // Define color scale for the legend based on the metric
        const colorScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range(selectedMetric === 'total_discharges' ? ['#D9E4F5', '#082567'] :
                   selectedMetric === 'avg_oop' ? ['#D9E4F5', '#082567'] :
                   ['#D9E4F5', '#082567']);
        // Loop through intervals and generate a label with a colored square
        for (let i = 0; i < grades.length; i++) {
            // Format values as currency only if they are not 'total_discharges'
            const formattedGrade = (selectedMetric === 'total_discharges')
                ? formatNumberWithCommas(Math.round(grades[i])) // Format with commas for total discharges
                : formatCurrency(grades[i]); // Format as USD for monetary values
            div.innerHTML +=
                '<i style="background:' + colorScale(grades[i]) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
                formattedGrade + '<br>';
        }
        return div;
    };
    // Add the new legend to the map
    legend.addTo(map);
}
// Call the function to initialize the map with a default value
updateChoropleth('avg_oop');
// Add event listener to update the map when the dropdown changes
document.getElementById('dataFilterNational').addEventListener('change', function() {
    updateChoropleth(this.value);
});

//State Information
function buildMetadata(state) {
    // Define the path to the pricesummary data
    var url = `/db_info/${state}`;
    // Use `d3.json` to fetch the price summary data and turn it into the JSON format
    d3.json(url).then(function(state){
      // Use d3 to select the panel with id of `#price-summary`
      let state_data = d3.select("#paymentBreakdownChart");
      console.log("paymentBreakdownChart selected", state_data)
      // Use `.html("") to clear any existing metadata
      state_data.html("");
      console.log("Cleared existing metadata")
    });
}

function buildCharts(state) {
    //log state that was selected
    console.log("Fetching data for state:", state);  
    
    // Get selected data type from the data filter dropdown
    var selectedMetric = document.getElementById('dataFilter').value; 
    
    //log
    console.log("Selected metric:", selectedMetric);

    // update URL to serve data specific to state
    var url = `/db_info/${state}`;

    // Fetch the data for the selected state
    d3.json(url).then(function(state_data) {

        // Group and aggregate data by MDC description, sum discharges, and average the other metrics
        let groupedData = Array.from(
            // Group data by MDC description
            d3.group(state_data, d => d.mdc_desc),
            ([key, values]) => ({
                mdc_desc: key,
                total_discharges: d3.sum(values, d => d.discharges),
                avg_oop: d3.mean(values, d => d.avg_oop),
                avg_medicare_payment: d3.mean(values, d => d.avg_medicare_payment)
            })
        );

        //Sort grouped data by the selected metric
        let sortedData = groupedData.sort((a, b) => {
            if (selectedMetric === 'discharges') {
                return b.total_discharges - a.total_discharges;
            } else if (selectedMetric === 'avg_oop') {
                return b.avg_oop - a.avg_oop;
            } else {
                return b.avg_medicare_payment - a.avg_medicare_payment;
            }
        }).slice(0, 10);

        //MDC descriptions and metric values
        let mdc_desc = sortedData.map(d => d.mdc_desc);  
        let metric_values = sortedData.map(d => {
            if (selectedMetric === 'discharges') {
                return d.total_discharges;
            } else if (selectedMetric === 'avg_oop') {
                return d.avg_oop;
            } else {
                return d.avg_medicare_payment;
            }
        });

        function truncateLabels(labels, maxLength) {
            return labels.map(label => label.length > maxLength ? label.slice(0, maxLength) + '...' : label);
        }

        // Assuming mdc_desc contains your y-axis labels
        let truncatedLabels = truncateLabels(mdc_desc, 35); // Truncate to 45 characters

        //Log the metric values for the selected
        console.log(`Metric Values for ${selectedMetric}:`, metric_values);

        // Create the bar trace using MDC descriptions
        let bar_trace = {
            y: mdc_desc,
            x: metric_values,
            type: 'bar',
            orientation: 'h',
            marker: {
                color: 'deep sapphire'
            },
            hoverinfo: 'text', // Show custom text on hover
            hovertext: mdc_desc.map((desc, index) => {
                // Format the value based on the selected metric
                let value = metric_values[index];
                let formattedValue;
                if (selectedMetric === 'avg_oop' || selectedMetric === 'avg_medicare_payment') {
                    formattedValue = `$${value.toFixed(2)}`; // Format as currency
                } else {
                    formattedValue = value.toString(); // Show as plain number
                }
                return `${desc}<br>${formattedValue}`; // Combine description and formatted value
            }),
        };

        //Adjust chart height based on the number of bars
        let chartHeight = Math.max(sortedData.length * 60, 600); 

        // Determine the tick format based on the selected metric
        let xAxisTickFormat;
        if (selectedMetric === 'avg_oop' || selectedMetric === 'avg_medicare_payment') {
            xAxisTickFormat = '$,.2f'; // Format as currency with two decimal places
        } else {
            xAxisTickFormat = ',d'; // Format as a plain number
        }

        let bar_layout = {
            title: `Top 10 MDC Codes by ${selectedMetric} in ${state}`,
            xaxis: { 
                title: selectedMetric,
                automargin: true,
                tickformat: xAxisTickFormat
            },
            yaxis: { 
                title: 'MDC Description',
                automargin: true,
                tickvals: mdc_desc,
                ticktext: truncatedLabels,
                tickfont: { size: 12 }
            },
            margin: {
                l: 250,
                r: 50, 
                b: 50,
                t: 100
            },
            height: chartHeight,  
            bargap: 0.2 
        };

        //bar chart
        Plotly.newPlot('topConditionsChart', [bar_trace], bar_layout);
    
        // Calculate the number of records
        let num_records = state_data.length;

        // Aggregate the average covered charge, average Medicare payment, and average OOP payment
        let avg_covered_charge = state_data.reduce((acc, d) => acc + (d.avg_covered_charge || 0), 0) / num_records;
        let avg_medicare_payment = state_data.reduce((acc, d) => acc + (d.avg_medicare_payment || 0), 0) / num_records;
        let avg_oop = state_data.reduce((acc, d) => acc + (d.avg_oop || 0), 0) / num_records;

        console.log("Covered Charge:", avg_covered_charge, "Medicare Payment:", avg_medicare_payment, "Out-of-Pocket:", avg_oop);

        // Format values as currency
        let currencyFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        });

        let formatted_values = [
            currencyFormatter.format(avg_covered_charge),
            currencyFormatter.format(avg_medicare_payment),
            currencyFormatter.format(avg_oop)
        ];

        // Calculate the unpaid portion of the covered charge
        let unpaid_portion = avg_covered_charge - (avg_medicare_payment + avg_oop);

        // Update the pie chart data to include the unpaid portion
        let pie_data = {
            values: [avg_medicare_payment, avg_oop, unpaid_portion],
            labels: ['Medicare Payment', 'Out-of-Pocket Payment', 'Unpaid Portion'],
            type: 'pie',
            textinfo: 'label+percent', // Show label and percentage
            text: [
                currencyFormatter.format(avg_medicare_payment),  // Medicare payment formatted as currency
                currencyFormatter.format(avg_oop),               // OOP payment formatted as currency
                currencyFormatter.format(unpaid_portion)         // Unpaid portion formatted as currency
            ],
            hoverinfo: 'label+text',
            marker: {
                colors: ['rgba(13, 52, 143, 0.7)',  // Variation of Blue for Medicare
                        'rgba(20, 80, 180, 0.7)',  // Variation of Blue for OOP
                        'rgba(100, 100, 100, 0.7)' // Gray for unpaid portion
                ]
            }
        };
        let pie_layout = {
            title: `Payment Breakdown:<br>Out-of-Pocket vs Medicare Payment vs Average Covered Charge for ${state}`
        };
        //pie chart
        Plotly.newPlot('paymentBreakdownChart', [pie_data], pie_layout);
    })
}  

//listener for the data filter dropdown
document.getElementById('dataFilter').addEventListener('change', function() {
    let selectedState = document.getElementById('state').value;  
    buildCharts(selectedState); 
});

function optionChanged(newState) {
    buildMetadata(newState);
    buildCharts(newState);
    console.log("Generating info for:", newState);
}

//Initialize the page w first state
function init() {
    var selector = d3.select("#state");

    d3.json("/state_list").then((states) => {
        states.forEach((state) => {
            selector
                .append("option")
                .text(state)
                .property("value", state);
        });

    //Get first state in the list
    const initState = states[0];
    console.log("Selected First Sample:", initState);
    
    //Build charts
    buildMetadata(initState);
    buildCharts(initState);
    state = initState;
    });
}

init();