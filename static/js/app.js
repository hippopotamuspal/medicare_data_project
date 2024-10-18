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
    })
}

init();