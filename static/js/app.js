// NATIONAL CHOROPLETH
// Initialize the map
let map = L.map('nationalChoropleth').setView([37.8, -96], 4);
// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
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
                        ? formatNumberWithCommas(feature.properties.value) // Format with commas for total discharges
                        : formatCurrency(feature.properties.value); // Format as USD for monetary values
                    layer.bindPopup(feature.properties.name + ': ' + formattedValue);
                }
            }).addTo(map);
            // Update the legend based on the new metric
            updateLegend(minValue, maxValue, selectedValue);
        });
    });
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
        div.style.backgroundColor = 'white';  // White background
        div.style.padding = '10px';           // Padding for the content
        div.style.border = '2px solid black'; // Optional border for the legend box
        div.style.borderRadius = '5px';       // Optional border radius for rounded corners
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
        div.innerHTML = `<strong>${title}</strong><br><br>`; // Bold title with some spacing
        const grades = [minValue, (minValue + maxValue) / 2, maxValue]; // Divide the range into three intervals
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
                formattedGrade + '<br>'; // No ranges, just one value per line
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
      // Use `Object.entries` to add each key and value pair to the panel
      Object.entries(state).forEach(function ([key, value]) {
        state_data.append("h6");
      });
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
            }
        };

        //Adjust chart height based on the number of bars
        let chartHeight = Math.max(sortedData.length * 60, 600); 

        let bar_layout = {
            title: `Top 10 MDC Codes by ${selectedMetric} in ${state}`,
            xaxis: { 
                title: selectedMetric,
                automargin: true
            },
            yaxis: { 
                title: 'MDC Description',
                automargin: true,
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
    

        // Aggregate the values for the pie chart via using d3 accumulator
        let avg_covered_charge = state_data.reduce((acc, d) => acc + (d.avg_covered_charge || 0), 0);
        let avg_medicare_payment = state_data.reduce((acc, d) => acc + (d.avg_medicare_payment || 0), 0);
        let avg_oop = state_data.reduce((acc, d) => acc + (d.avg_oop || 0), 0);

        console.log("Covered Charge:", avg_covered_charge, "Medicare Payment:", avg_medicare_payment, "Out-of-Pocket:", avg_oop);

        let pie_data = {
            values: [avg_covered_charge, avg_medicare_payment, avg_oop],
            labels: ['Average Covered Charge', 'Medicare Payment', 'Out-of-Pocket Payment'],
            type: 'pie',
            marker: {
                colors: ['rgba(13, 52, 143, 0.7)',  // Variation of Blue
                         'rgba(20, 80, 180, 0.7)',  // Variation of Blue
                         'rgba(35, 37, 300, 0.7)'   // Deep Sapphire Blue
                ]
            }
        };
        let pie_layout = {
            title: `Payment Breakdown for ${state}`
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