
  
/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */
var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// add the graph canvas to the body of the webpage
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Append an SVG group
var chart = svg.append("g"); 

// Append a div to the body to create tooltips, assign it a class
d3.select(".scatter").append("div").attr("class", "tooltip").style("opacity", 0);

// Retrieve data from the CSV file 
d3.csv("data/data.csv", function(err, censusData) {
  if (err) throw err;

  censusData.forEach(function(data) {
    data.state = data.state;
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    
  });


  // Create scale functions
  var yLinearScale = d3.scaleLinear().range([height, 0]);

  var xLinearScale = d3.scaleLinear().range([0, width]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

 // setup x and y value
  var xMin;
  var xMax;
  var yMax;

  // This function  
  function findMinAndMax(dataX) {
    xMin = d3.min(censusData, function(data) {
      return +data[dataX] * 0.8;
    });

    xMax = d3.max(censusData, function(data) {
      return +data[dataX] * 1.1;
    });

    yMax = d3.max(censusData, function(data) {
      return +data.healthcare * 1.1;
    });
  }

  // The default x-axis is 'poverty'
  var currentAxisLabelX = "poverty";

  // Call findMinAndMax() with 'poverty' as default
  findMinAndMax(currentAxisLabelX);

  // Set the domain of an axis to extend from the min to the max value of the data column
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([0, yMax]);

  // Initialize tooltip
  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    // Define position
    .offset([-10, 20])
    
   .html(function(data) {
      var state = data.state;
      var poverty = +data.poverty;
      var healthcare = +data.healthcare;
      return state  +
      "<br> " + 
      "Poverty: " + poverty + "%" +
      "<br>" +
      "Healthcare: " + healthcare + "%" ;
    }); 

  // Create tooltip
  chart.call(toolTip);

  chart
    .selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function(data, index) { return xLinearScale(+data[currentAxisLabelX]); })
    .attr("cy", function(data, index) { return yLinearScale(+data.healthcare); })
    .attr("r", "12")
    .attr("fill", '#4bcce3')
    .on("mouseover", function(data) { toolTip.show(data); })
    .on("mouseout", function(data, index) { toolTip.hide(data); });

  chart.append("text")
    .style("text-anchor", "middle")
    .attr("class", "plot-text")    
    .selectAll("tspan")
    .data(censusData)
    .enter()
    .append("tspan")
    .attr("x", function(data) { return xLinearScale(+data[currentAxisLabelX]); })
    .attr("y", function(data) { return yLinearScale(+data.healthcare - 0.2); })
    .text(function(data) { return data.abbr });

// Append an SVG group for the x-axis, then display the x-axis
  chart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    // The class name assigned here will be used for transition effects
    .attr("class", "x-axis")
    .call(bottomAxis);

  // Append a group for y-axis
  chart.append("g").call(leftAxis);

  // Append y-axis label
  chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("class", "axis-text")
    .attr("data-axis-name", "num_hits")
    .text("Lacks Healthcare (%)");

  // Append x-axis labels
  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
    )
    // This axis label is active by default
    .attr("class", "axis-text active")
    .attr("data-axis-name", "hair_length")
    .text("In Poverty (%)")
    .enter().append("text")
    .text("Age (Median) ");

});  
