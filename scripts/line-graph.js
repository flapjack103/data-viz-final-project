/*
* Copyright (C) 2016 by Mark DiMarco
* http://bl.ocks.org/markmarkoh/8700606
* License: MIT
*
* Modified by Alexandra (Grant) Bueno 2017
*
*/

var margin = {top: 80, right: 80, bottom: 80, left: 80},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parse = d3.time.format("%Y").parse;
var color = d3.scale.category10();

var currYAxis = "num_git_commits"
var currSelectedLanguages = [];

var graphTooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", "10")
  .style("border-bottom", "1px dotted black;")
	.style("visibility", "hidden")
	.text("a simple tooltip")
  .style("background-color", "black")
  .style("color", "#fff")
  .style("border-radius", "6px")
  .style("padding", "5px 2px")
  .style("text-align", "center");

// Scales and axes. Note the inverted domain for the y-scale: bigger is up!
var x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true),
    yAxis = d3.svg.axis().scale(y).ticks(4).orient("right");

// An area generator, for the light fill.
var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.year); })
    .y0(height)
    .y1(function(d) { return y(d.value); });

// A line generator, for the dark stroke.
var line = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.value); });

var languageList = ["C#", "C++", "CoffeeScript", "CSS", "Go", "HTML", "Java", "Javascript", "Lisp", "Objective-C", "Perl", "PHP", "Python", "Ruby", "Rust", "TypeScript"];
createLanguageList(languageList);

var redrawLineGraph = function(languages) {
  if (languages == undefined || languages.length == 0) {
    languages = currSelectedLanguages;
  } else {
    currSelectedLanguages = languages;
  }
  if (currSelectedLanguages.length == 0) {
    $('#prompt').show();
  } else {
    $('#prompt').hide();
  }
  $("#line-graph").empty();
  d3.csv("https://raw.githubusercontent.com/flapjack103/data/master/languages-overview.csv", type, function(error, data) {
    var graphData = [];
    var pointData = [];
    var maxValue = 0;
    for (var i = 0; i < languages.length; i++) {
      var values = data.filter(function(d) {
        return d.language == languages[i];
      });
      for ( var j = 0; j < values.length; j++) {
        if (values[j].value > maxValue) {
          maxValue = values[j].value;
        }
        var pointValue = values[j];
        pointValue.language = languages[i];
        pointData.push(pointValue);
      }
      values.language = languages[i];
      graphData.push(values);
    }

    // Compute the minimum and maximum date, and the maximum value.
    var mindate = new Date(2009,12,0),
    maxdate = new Date(2015,1,0);
    x.domain([mindate, maxdate]);
    y.domain([0, maxValue]).nice();

    // Add an SVG element with the desired dimensions and margin.
    var svg = d3.select("#line-graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Add the clip path.
    svg.append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    // Add the x-axis.
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add x-axis label.
    svg.append("text")
          .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 30) + ")")
          .style("text-anchor", "middle")
          .text("Year")
          .style({
              "fill":"#000000",
              "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
              "font-size": "12px"
          });

    // Add the y-axis.
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(yAxis);

    // Add y-axis label.
    svg.append("text")
        .attr("transform", "rotate(90)")
        .attr("x", (height / 2))
        .attr("y", -(width + margin.left))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(function(){ if (currYAxis == "num_git_commits") {return "Git Commits"}; return "StackOverflow Questions Asked";})
        .style({
            "fill":"#000000",
            "font-family":"Helvetica Neue, Helvetica, Arial, san-serif",
            "font-size": "12px"
        });

    var paths = svg.selectAll('.line')
      .data(graphData)
      .enter()
      .append('path')
      .attr('class', 'line')
      .style('stroke', function(d) {
        return color(d.language);
      })
      .attr('clip-path', 'url(#clip)')
      .attr('d', function(d) {
        return line(d);
      });

      // Add the scatterplot
     svg.selectAll("dot")
         .data(pointData)
       .enter().append("circle")
         .attr("r", 3.5)
         .attr("cx", function(d) { return x(d.year); })
         .attr("cy", function(d) { return y(d.value); })
         .on("mouseover", function(d) {
           graphTooltip.text("Language: " + d.language + ", Value: " + d.value);
           return graphTooltip.style("visibility", "visible");})
         .on("mousemove", function(d){return graphTooltip.style("top",
             (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
         .on("mouseout", function(d) {return graphTooltip.style("visibility", "hidden");})
         .style("fill", function(d) { return color(d.language);});

    /* Add 'curtain' rectangle to hide entire graph */
    var curtain = svg.append('rect')
      .attr('x', -1 * width)
      .attr('y', -1 * height)
      .attr('height', height)
      .attr('width', width)
      .attr('class', 'curtain')
      .attr('transform', 'rotate(180)')
      .style('fill', '#ffffff');

    /* Create a shared transition for anything we're animating */
    var t = svg.transition()
      .delay(750)
      .duration(3000)
      .ease('linear')
      .each('end', function() {
        d3.select('line.guide')
          .transition()
          .style('opacity', 0)
          .remove()
      });

    t.select('rect.curtain')
      .attr('width', 0);
    t.select('line.guide')
      .attr('transform', 'translate(' + width + ', 0)')

  });
}

// Parse dates and numbers. We assume values are sorted by date.
function type(d) {
  d.year = parse(d.year);
  d.value =+ d[currYAxis];
  return d;
}

function createLanguageList(languages) {
  for (var i = 0; i < languages.length; i++) {
    var $li = $('<li>').append('<input value="' + languages[i] + '" type="checkbox">  ' + languages[i]);
    $li.addClass("list-group-item");

    $li.click(function() {
      if(this.firstChild.checked) {
        this.firstChild.checked = false;
      } else {
        this.firstChild.checked = true;
      }
      updateSelection(this);
    });

    $li.change(function() {updateSelection(this)});

    $li.hover(
      function() {
        $( this ).addClass( "list-hover" );
      }, function() {
        $( this ).removeClass( "list-hover" );
      }
    );
    $('#language-list ul').append($li);
  }
}

function updateSelection(that) {
  var checkedLanguages = [];
  var checked = $( "input:checked" );
  for (var i = 0; i < checked.length; i++) {
    checkedLanguages.push(checked[i].value);
  }
  if (that.firstChild.checked) {
    $( that ).css({"background-color": color(that.firstChild.value)});
    $( that ).css({"color": "#fff"});
  } else {
    $( that ).css({"background-color": "#fff"});
    $( that ).css({"color": "#000"});
  }
  redrawLineGraph(checkedLanguages);
}
