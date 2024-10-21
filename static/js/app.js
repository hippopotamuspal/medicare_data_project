function init() {
    var selector = d3.select("#state");
    d3.json("/state_list").then((states) => {
        states.forEach((state) => {
            selector
                .append("option")
                .text(state)
                .property("value", state);
        });
    const initState = states[0];
    buildpaymentBreakdownChart(initState);
    state = initState;
    })
}
init();

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
