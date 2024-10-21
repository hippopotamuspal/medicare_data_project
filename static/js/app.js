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
                    layer.bindPopup(feature.properties.name + ': ' + feature.properties.value);
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
            .range(['#d9e4f5', '#082567']);
    } else if (selectedMetric === 'avg_oop') {
        // Link Blue to Deep Sapphire
        colorScale = d3.scaleLinear()
            .domain([minValue, 4000])
            .range(['#d9e4f5', '#082567']);
    } else if (selectedMetric === 'avg_insured') {
        // Link Blue to Deep Sapphire
        colorScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range(['#d9e4f5', '#082567']);
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
            .range(selectedMetric === 'total_discharges' ? ['#d9e4f5', '#082567'] :
                   selectedMetric === 'avg_oop' ? ['#d9e4f5', '#082567'] :
                   ['#d9e4f5', '#082567']);

        // Loop through intervals and generate a label with a colored square
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colorScale(grades[i]) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
                Math.round(grades[i]) + (grades[i + 1] ? '&ndash;' + Math.round(grades[i + 1]) + '<br>' : '+');
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
        state_data.append("h6").text(`${key}: ${value}`);
      });
    });
  }

function buildCharts(state) {
    // Define the path that contains the dictionary of room types and the counts of room types in each neighborhood
    var url = `/db_info/${state}`;
    // Use `d3.json` to fetch the room types labels and the room types counts and turn it into the JSON format (becomes like a dictionary)
    d3.json(url).then(function(state_data) {
      // Create lists for the keys and values to separate them for the chart
      var state_keys = [];
      var state_values = [];
      console.log("avg_tot:", state_keys)
      console.log("avg_tot:", state_values)

      let avg_covered_charge = state_data.avg_covered_charge;
      let avg_total_payment = state_data.avg_total_payment;
      let avg_medicare_payment = state_data.avg_medicare_payment;
      let avg_oop = state_data.avg_oop;

      console.log("avg_covered_charge:", avg_covered_charge);
      console.log("avg_total_payment:", avg_total_payment);
      console.log("avg_medicare_payment:", avg_medicare_payment);
      console.log("avg_oop:", avg_oop);

      // Create a loop that separates the keys and values into separate lists 
      for (var k in state_data) {
        state_keys.push(k);
        state_values.push(state_data[k])};
          // Create a trace of the separated lists and define the chart type as "pie" and the chart colors 
          var trace3 = [{
            values: state_values,
            labels: state_keys,
            type: "pie",
            marker: {
                color: pie_colors
            }
          }];
          // Add chart title
          var layout3 = {
            title: "Room Types"
          };
          // Create pie chart
          Plotly.newPlot('paymentBreakdownChart', trace3, layout3);
        });
    }

function optionChanged(newState) {
    // Trigger all formulas so that the charts and colors all populate
    buildMetadata(newState);
    buildCharts(newState);
    console.log("Generating info for:", newState)
    state = newState;
    }



function init() {

    var selector = d3.select("#state");

    d3.json("/state_list").then((states) => {
        states.forEach((state) => {
            selector
                .append("option")
                .text(state)
                .property("value", state);
        });
    
    console.log("Populated the dropdown with list of states");

    //Getting the first state in the list
    const initState = states[0];
    console.log("Selected First Sample:", initState);
    
    //Building the charts
    buildMetadata(initState);
    buildCharts(initState);
    state = initState;
    });
}

init();