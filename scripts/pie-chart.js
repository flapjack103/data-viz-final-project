/*
* Copyright (C) 2017 by David Buezas
* http://bl.ocks.org/dbuezas/9306799
* License: MIT
*
* Modified by Alexandra (Grant) Bueno 2017
*
*/

var initPieChart = function () {
  var svg = d3.select("#pie-chart-container")
	.append("svg")
  .style("height", "800px")
	.append("g")

  svg.append("g")
  	.attr("class", "slices");
  svg.append("g")
  	.attr("class", "labels");
  svg.append("g")
  	.attr("class", "lines");

  var width = 960,
      height = 450,
  	radius = Math.min(width, height) / 2;

  var pieTooltip = d3.select("body")
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

  var pie = d3.layout.pie()
  	.sort(null)
  	.value(function(d) {
  		return d.value;
  	});

  var arc = d3.svg.arc()
  	.outerRadius(radius * 0.8)
  	.innerRadius(radius * 0.4);

  var outerArc = d3.svg.arc()
  	.innerRadius(radius * 0.9)
  	.outerRadius(radius * 0.9);

  svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var key = function(d){ return d.data.label; };

  var color = d3.scale.category10();

  function redrawPieChart(year) {
    var data = [];
    var total_commits = 0;
    for (var i = 0; i < languageData.length; i++) {
      var d = languageData[i];
      if (d.year == year) {
        total_commits += d.num_git_commits;
        var v = {
          label: d.language,
          value: d.num_git_commits,
        }
        data.push(v);
      }
    }
    data = data.map(function(d){
      return { label: d.label, value: d.value/parseFloat(total_commits), commits: d.value};
    });
    change(data);
  }

  function change(data) {
    console.log(data);
  	/* ------- PIE SLICES -------*/
  	var slice = svg.select(".slices").selectAll("path.slice")
  		.data(pie(data), key);

  	slice.enter()
  		.insert("path")
  		.style("fill", function(d) { return color(d.data.label); })
      .on("mouseover", function(d) {
        pieTooltip.text("Language: " + d.data.label + " " + (d.data.value * 100).toFixed(2) + "% (" + d.data.commits +" commits)");
        return pieTooltip.style("visibility", "visible");})
      .on("mousemove", function(d){return pieTooltip.style("top",
          (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(d) {return pieTooltip.style("visibility", "hidden");})
  		.attr("class", "slice");

  	slice
  		.transition().duration(1000)
  		.attrTween("d", function(d) {
  			this._current = this._current || d;
  			var interpolate = d3.interpolate(this._current, d);
  			this._current = interpolate(0);
  			return function(t) {
  				return arc(interpolate(t));
  			};
  		})

  	slice.exit()
  		.remove();

  	/* ------- TEXT LABELS -------*/

  	var text = svg.select(".labels").selectAll("text")
  		.data(pie(data), key);

  	text.enter()
  		.append("text")
  		.attr("dy", ".35em")
  		.text(function(d) {
  			return d.data.label;
  		});

  	function midAngle(d){
  		return d.startAngle + (d.endAngle - d.startAngle)/2;
  	}

  	text.transition().duration(1000)
  		.attrTween("transform", function(d) {
  			this._current = this._current || d;
  			var interpolate = d3.interpolate(this._current, d);
  			this._current = interpolate(0);
  			return function(t) {
  				var d2 = interpolate(t);
  				var pos = outerArc.centroid(d2);
  				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
  				return "translate("+ pos +")";
  			};
  		})
  		.styleTween("text-anchor", function(d){
  			this._current = this._current || d;
  			var interpolate = d3.interpolate(this._current, d);
  			this._current = interpolate(0);
  			return function(t) {
  				var d2 = interpolate(t);
  				return midAngle(d2) < Math.PI ? "start":"end";
  			};
  		});

  	text.exit()
  		.remove();

  	/* ------- SLICE TO TEXT POLYLINES -------*/

  	var polyline = svg.select(".lines").selectAll("polyline")
  		.data(pie(data), key);

  	polyline.enter()
  		.append("polyline");

  	polyline.transition().duration(1000)
  		.attrTween("points", function(d){
  			this._current = this._current || d;
  			var interpolate = d3.interpolate(this._current, d);
  			this._current = interpolate(0);
  			return function(t) {
  				var d2 = interpolate(t);
  				var pos = outerArc.centroid(d2);
  				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
  				return [arc.centroid(d2), outerArc.centroid(d2), pos];
  			};
  		});

  	polyline.exit()
  		.remove();
  };

  return redrawPieChart;
}
