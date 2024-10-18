var state = "MN";

var pie_colors = ['#3D2B56','#A26769', '#D5B9B2', '#ECE2D0', '#CEBEBE', 'rgb(102, 102, 102)','rgb(76, 76, 76)','rgb(153, 153, 153)','rgb(204, 204, 204)','rgb(229, 229, 229)'];

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
    buildpaymentBreakdownChart(newState);
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