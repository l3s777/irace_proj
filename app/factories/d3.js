app.factory('d3', [function () {
  var d3 = require('d3');
  return d3;
}])
  .directive('d3ParallelCoordinatesPlot', ['d3', function (d3) {
  	return {
  		restrict: 'EA',
  		scope: {
  			data: "=",
  			label: "@",
        onClick: '&'
  		},
  		link: function (scope, iElement, iAttrs) {
  			// create the svg to contain our visualization
  			var svg = d3.select(iElement[0])
  				.append("svg")
  				.style("width", "100%"); // responsive

  			// make the visualization responsive by watching for changes in window size
  			window.onresize = function () {
  				return scope.$apply();
  			};

  			scope.$watch(function () {
  				return angular.element(window)[0].innerWidth;
  			}, function () {
  				return scope.render(scope.data);
  			});

  			// watch the data source for changes to dynamically update the visualization
  			scope.$watch('data', function (newData, oldData) {
  				return scope.render(newData);
  			}, true);

  			scope.render = function (data) {
  				// clear out everything in the svg to render a fresh version
  				svg.selectAll("*").remove();

  				// set up variables
  				var width, height, max;
  				width = d3.select(iElement[0])[0][0].offsetWidth;
  				height = 400;
  				var margins = {top: 50, right: 100, bottom: 50, left: 100 };
  				svg.attr('height', height)
  					.attr('width', width)
  					.append("g")
  					.attr("transform", "translate(" + margins.left + "," + margins.top + ")");

  				var x = d3.scale.ordinal().rangePoints([0, width], 1),
  					y = {},
  					dragging = {};

  				var line = d3.svg.line(),
  					axis = d3.svg.axis().orient("left"),
  					background,
  					foreground,
  					irsBlue = 'rgb(82, 154, 189)';

  				if(data != '') {
  					d3.csv(data, function (error, cars) {

  						// Extract the list of dimensions and create a scale for each.
  						x.domain(dimensions = d3.keys(cars[0]).filter(function (d, index) {
  							var isNumerical = true;
  							d3.extent(cars, function (p) {
  								if(isNaN(p[d]))
  									isNumerical = false;
  							})
  							if(isNumerical) {
  								return d != "name" && (y[d] = d3.scale.linear()
  										.domain(d3.extent(cars, function (p) {
  											return +p[d];
  										}))
  										.range([height - margins.bottom, margins.top]));
  							}
  							else {
  								return y[d] = d3.scale.ordinal()
  									.domain(cars.map(function(p) { return p[d]; }))
  									.rangePoints([height - margins.bottom, margins.top]);
  							}
  						}));

  						// Add grey background lines for context.
  						background = svg.append("g")
  							.attr("class", "background")
  							.selectAll("path")
  							.data(cars)
  							.enter().append("path")
  							.attr("d", path);

  						// Add blue foreground lines for focus.
  						foreground = svg.append("g")
  							.attr("class", "foreground")
  							.selectAll("path")
  							.data(cars)
  							.enter().append("path")
  							.attr("d", path);

  						// Add a group element for each dimension.
  						var g = svg.selectAll(".dimension")
  							.data(dimensions)
  							.enter().append("g")
  							.attr("class", "dimension")
  							.attr("transform", function (d) {
  								return "translate(" + x(d) + ")";
  							});
  							// .call(d3.behavior.drag()
  							// 	.origin(function (d) {
  							// 		return {x: x(d)};
  							// 	})
  							// 	.on("dragstart", function (d) {
  							// 		dragging[d] = x(d);
  							// 		background.attr("visibility", "hidden");
  							// 	})
  							// 	.on("drag", function (d) {
  							// 		dragging[d] = Math.min(width, Math.max(0, d3.event.x));
  							// 		foreground.attr("d", path);
  							// 		dimensions.sort(function (a, b) {
  							// 			return position(a) - position(b);
  							// 		});
  							// 		x.domain(dimensions);
  							// 		g.attr("transform", function (d) {
  							// 			return "translate(" + position(d) + ")";
  							// 		})
  							// 	})
  							// 	.on("dragend", function (d) {
  							// 		delete dragging[d];
  							// 		transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
  							// 		transition(foreground).attr("d", path);
  							// 		background
  							// 			.attr("d", path)
  							// 			.transition()
  							// 			.delay(500)
  							// 			.duration(0)
  							// 			.attr("visibility", null);
  							// 	}));

  						// Add an axis and title.
  						g.append("g")
  							.attr("class", "axis")
  							.each(function (d) {
  								d3.select(this).call(axis.scale(y[d]));
  							})
  							.append("text")
  							.style("text-anchor", "middle")
  							.attr("y", margins.top-9)
  							.text(function (d) {
  								return d;
  							});

  						// Add and store a brush for each axis.
  						g.append("g")
  							.attr("class", "brush")
  							.each(function (d) {
  								d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
  							})
  							.selectAll("rect")
  							.attr("x", -8)
  							.attr("width", 16);
  					});
  				}

  				function position(d) {
  					var v = dragging[d];
  					return v == null ? x(d) : v;
  				}

  				function transition(g) {
  					return g.transition().duration(500);
  				}

          // Returns the path for a given data point.
  				function path(d) {
  					return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
  				}

  				function brushstart() {
  					d3.event.sourceEvent.stopPropagation();
  				}

          // Handles a brush event, toggling the display of foreground lines.
  				function brush() {
  					var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
  						extents = actives.map(function(p) { return y[p].brush.extent(); });
  					foreground.style("display", function(d) {
  						return actives.every(function(p, i) {
  							return extents[i][0] <= d[p] && d[p] <= extents[i][1];
  						}) ? null : "none";
  					});
  				}

  			};
		}
	};
}])
.directive('d3BoxPlot', ['d3', function (d3) {
return {
  restrict: 'EA',
  scope: {
    data: "=",
    label: "@",
  },
  link: function (scope, iElement, iAttrs) {
    // create the svg to contain our visualization
    var svg = d3.select(iElement[0])
      .append("svg")
      .attr("width", "100%");

    // make the visualization responsive by watching for changes in window size
    window.onresize = function () {
      return scope.$apply();
    };
    scope.$watch(function () {
      return angular.element(window)[0].innerWidth;
    }, function () {
      return scope.render(scope.data);
    });

    // watch the data source for changes to dynamically update the visualization
    scope.$watch('data', function (newData, oldData) {
      return scope.render(newData);
    }, true);


    scope.render = function (data) {
      // clear out everything in the svg to render a fresh version
      svg.selectAll("*").remove();

      // set up variables
      var width, height, max;
      width = d3.select(iElement[0])[0][0].offsetWidth;
      height = 400;
      svg.attr('height', height);
      svg.attr('width', width);

      var irsBlue = 'rgb(82, 154, 189)';

      var yMax = -Infinity,
        yMin = Infinity;
      var xValues = [];
      xValues.push(' ');

      data.forEach(function (d, index) {
        xValues.push(parseInt(d[0]));
        d.forEach(function(p, ix) {
          if(ix > 0) {
            if(p > yMax) yMax = p;
            if(p < yMin) yMin = p;
          }
        })
      });
      xValues.push('\t');

      var margins = {top: 50, right: 50, bottom: 50, left: 70 },
        yScale = d3.scale.linear().range([height - margins.top, margins.bottom])
          .domain([yMin, yMax]),
        yAxis = d3.svg.axis()
          .scale(yScale)
          .orient("left");
      var xScale = d3.scale.ordinal()
          .domain(xValues)
          .rangePoints([margins.left, width - margins.right]),
        xAxis = d3.svg.axis()
          .scale(xScale)
          .orient("bottom");

      // Axis
      svg.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margins.bottom) + ")")
        .call(xAxis)
        // .selectAll("text")
        .style("text-anchor", "end")
      svg.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margins.left) + "," + (margins.top - margins.bottom) + ")")
        .call(yAxis);

      var bar_width = 40;

      // Grid
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + margins.left + "," + (margins.top - margins.bottom) + ")")
        .call(yAxis
          .tickSize(-(width - margins.left - margins.right), 0, 0)
          .tickFormat(""));

      function computeValues(iteration) {
        var min,
          max,
          mid,
          value = Number,
          n = iteration.length;

        iteration = iteration.map(value).sort(d3.ascending);// d3.entries(iteration).sort(function(x) { return d3.ascending(x); });
        max = iteration[n-1];
        min = iteration[0];
        mid = iteration[Math.round(n/2)];
        q25 = iteration[Math.round(n/4)];
        q75 = iteration[Math.round(3*n/4)];

        return [min, max, mid, q25, q75];
      }

      data.forEach(function(iteration, index) {
        // first entry
        var val = yScale(iteration[0]);
        // each bar is related to the index of the scale
        var bar_x = xScale(iteration[0]) - bar_width/2;
        var aux = iteration.slice(1, iteration.length - 1);
        var values = computeValues(aux);
        min = values[0];
        max = values[1];
        mid = values[2];
        q25 = values[3];
        q75 = values[4];

        // Center line
        svg.append("line")
          .attr("x1", xScale(iteration[0]))
          .attr("y1", yScale(min))
          .attr("x2", xScale(iteration[0]))
          .attr("y2", yScale(max))
          .attr("stroke-width", 2)
          .attr("stroke", irsBlue);

        // IQR
        svg.append("rect")
          .style({
            fill: "#f1f1f1"
          })
          // set initial dimensions of the bar
          .attr("width", bar_width)
          // position bar
          .attr("x", bar_x)
          .attr("y", yScale(q75))
          .attr("height", yScale(q25) - yScale(q75))
          .attr("stroke", irsBlue);

        // upper line rect
        svg.append("line")
          .attr("x1", bar_x)
          .attr("y1", yScale(q75))
          .attr("x2", bar_x+bar_width)
          .attr("y2", yScale(q75))
          .attr("stroke-width", 1)
          .attr("stroke", "black");

        // bottom line rect
        svg.append("line")
          .attr("x1", bar_x)
          .attr("y1", yScale(q25))
          .attr("x2", bar_x+bar_width)
          .attr("y2", yScale(q25))
          .attr("stroke-width", 1)
          .attr("stroke", "black");

        // Min, mid and max
        svg.append("line")
          .attr("x1", bar_x)
          .attr("y1", yScale(min))
          .attr("x2", bar_x+bar_width)
          .attr("y2", yScale(min))
          .attr("stroke-width", 1)
          .attr("stroke", "black");
        svg.append("line")
          .attr("x1", bar_x)
          .attr("y1", yScale(mid))
          .attr("x2", bar_x+bar_width)
          .attr("y2", yScale(mid))
          .attr("stroke-width", 1)
          .attr("stroke", "black");
        svg.append("line")
          .attr("x1", bar_x)
          .attr("y1", yScale(max))
          .attr("x2", bar_x+bar_width)
          .attr("y2", yScale(max))
          .attr("stroke-width", 1)
          .attr("stroke", "black");
      });

    };
  }
};
}])
.directive('d3BarPlot', ['d3', function (d3) {
  return {
    restrict: 'EA',
    scope: {
      data: "=",
      label: "@",
    },
    link: function (scope, iElement, iAttrs) {
      // create the svg to contain our visualization
      var svg = d3.select(iElement[0])
        .append("svg")
        .attr("width", "100%");

      // make the visualization responsive by watching for changes in window size
      window.onresize = function () {
        return scope.$apply();
      };
      scope.$watch(function () {
        return angular.element(window)[0].innerWidth;
      }, function () {
        return scope.render(scope.data);
      });

      // watch the data source for changes to dynamically update the visualization
      scope.$watch('data', function (newData, oldData) {
        return scope.render(newData);
      }, true);


      scope.render = function (data) {
        // clear out everything in the svg to render a fresh version
        svg.selectAll("*").remove();

        // set up variables
        var width, height, max;
        width = d3.select(iElement[0])[0][0].offsetWidth;
        height = 220;
        svg.attr('height', height);
        svg.attr('width', width);

        var irsBlue = 'rgb(82, 154, 189)';

        // TODO remove
        // console.log(data);

        // define data
        var dataLabels = []; // x values
        var yValues = []; // y values
        var charTitle, chartSubtitle;

        data.x_values.forEach(function(d){
          dataLabels.push(d);
        });

        data.y_values.forEach(function(d){
          yValues.push(parseInt(d));
        });

        // yValues = data.y_values;
        chartTitle = data.param;
        if(data.type === "c") {
          chartSubtitle = "categorical";
        } else if(data.type === "o") {
          chartSubtitle = "ordinal";
        }

        var maxValue = d3.max(yValues);
        var margins = {top: 50, right: 50, bottom: 50, left: 70 };

        var yScale = d3.scale.linear().range([height - margins.top, margins.bottom])
            .domain([0, maxValue])
            .nice()
            // y Axis
          yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
        var xScale = d3.scale.ordinal()
            .domain(dataLabels)
            .rangeRoundBands([margins.left, width - margins.right], .1),
            // x Axis
          xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

        // Axis
        svg.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height - margins.bottom) + ")")
          .call(xAxis)
          .style("text-anchor", "end")
        svg.append("svg:g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + (margins.left) + "," + (margins.top - margins.bottom) + ")")
          .call(yAxis);

        // Grid
        svg.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(" + margins.left + "," + (margins.top - margins.bottom) + ")")
          .call(yAxis
            .tickSize(-(width - margins.left - margins.right), 0, 0)
            .tickFormat(""));

        //create the bars
        svg.selectAll("rect")
            .data(yValues).enter()
            .append("rect")
            .style({
              fill: "#f1f1f1"
            })
            // set initial dimensions of the bar
            .attr("width", function(){return xScale.rangeBand();})
            .attr("x", function(d,i) { return xScale(dataLabels[i]);}) // position bar
            .attr("y", function(d,i) { return (yScale(d)); })
            .attr("height", function(d,i) { return height - yScale(d) - margins.top; })
            .attr("stroke", irsBlue);

        svg.append("text")
            .attr("class","mainTitle")
            .attr("x",20)
            .attr("y",25)
            .attr("font-size", "20px")
            .text(chartTitle);
        svg.append("text")
            .attr("class","subTitle")
            .attr("x",20)
            .attr("y",40)
            .attr("font-size", "10px")
            .text(chartSubtitle);
      };
    }
  };
}])
// .directive('d3DensityPlot', ['d3', function (d3) {
//   return {
//     restrict: 'EA',
//     scope: {
//       data: "=",
//       label: "@",
//     },
//     link: function (scope, iElement, iAttrs) {
//       // create the svg to contain our visualization
//       var svg = d3.select(iElement[0])
//         .append("svg")
//         .attr("width", "100%");
//
//       // make the visualization responsive by watching for changes in window size
//       window.onresize = function () {
//         return scope.$apply();
//       };
//       scope.$watch(function () {
//         return angular.element(window)[0].innerWidth;
//       }, function () {
//         return scope.render(scope.data);
//       });
//
//       // watch the data source for changes to dynamically update the visualization
//       scope.$watch('data', function (newData, oldData) {
//         return scope.render(newData);
//       }, true);
//
//       scope.render = function (data) {
//         // clear out everything in the svg to render a fresh version
//         svg.selectAll("*").remove();
//
//         var init = 0, end = 100;
//         // ranges definition
//         if(data.range) {
//           var a = (data.range.split(","));
//           init = a[0].substring(1);
//           if(init < 1) init = 0;
//           var lleng = a[1].length;
//           end = a[1].substring(0,lleng-1);
//         }
//
//         // set up variables
//         var width, height, max;
//         width = d3.select(iElement[0])[0][0].offsetWidth;
//         height = 220;
//         svg.attr('height', height);
//         svg.attr('width', width);
//
//         var irsBlue = 'rgb(82, 154, 189)';
//
//         // define data
//         var chartTitle = data.param;
//         var chartSubtitle = data.type;
//         if(data.type === "i") {
//           chartSubtitle = "integer";
//         } else if(data.type === "r") {
//           chartSubtitle = "real";
//         }
//
//         var margin = {top: 50, right: 50, bottom: 50, left: 70};
//
//         var yScale = d3.scale.linear()
//             .range([height - margin.top, margin.bottom])
//             .nice()
//             .domain([0, 1]);
//
//         var xScale = d3.scale.linear()
//             .domain([0, parseFloat(end)])
//             // .domain([parseInt(init), parseInt(end)])
//             .rangeRound([margin.left, width - margin.right]);
//
//         var xAxis = d3.svg.axis()
//             .scale(xScale)
//             .orient("bottom");
//         var yAxis = d3.svg.axis()
//             .scale(yScale)
//             .orient("left")
//             .tickFormat(d3.format("%"));
//
//         // histogram
//         var histogram = d3.layout.histogram()
//             .frequency(false)
//             .bins(xScale.ticks(7));
//
//         var d = histogram(data.values);
//
//         var ticks = parseInt(end);
//         var stdDev = standardDeviation(data.values);
//
//         // console.log(data.values);
//         var min_ = d3.min(data.values);
//
//         // ((4/3)*stDev^5/ticks)^(-1/5)
//         var scaleGaussianKernel = Math.pow(((4/3)*Math.pow(stdDev,5)/min_),(-1/5));
//
//         // var kde = kernelDensityEstimator(gaussianKernel(valueKernel), xScale.ticks(ticks));
//         var kde = kernelDensityEstimator(gaussianKernel(scaleGaussianKernel), xScale.ticks(ticks));
//
//         function kernelDensityEstimator(kernel, x) {
//           return function(sample) {
//             return x.map(function(x) {
//               x = parseFloat(x);
//               // normalization
//               // x_norm = 100*(x-min_tick)/(max_tick-min_tick);
//               var aux = 0;
//               sample.forEach(function (d) {
//                   d = parseFloat(d);
//                   aux = aux + kernel(d - x);
//               });
//               aux = aux/sample.length;
//
//               // var aux = d3.mean(sample, function(v) {
//               //   console.log(v);
//               //   v = parseFloat(v);
//               //   return kernel(v-x); });
//               return [x, aux];
//             });
//           };
//         }
//
//         function gaussianKernel(scale) {
//           return function(u) {
//             u = u/scale;
//
//             var gaussianConstant = 1 / Math.sqrt(2 * Math.PI);
//             var gaussianKernelValue = gaussianConstant * Math.exp((-.5) * u * u);
//
//             return parseFloat(gaussianKernelValue);
//           };
//         }
//
//         function standardDeviation(values) {
//           var avg = average(values);
//
//           var squareDiffs = values.map(function(value) {
//             var diff = value - avg;
//             return (diff * diff);
//           });
//
//           var avgSquareDiff = average(squareDiffs);
//
//           return parseFloat(Math.sqrt(avgSquareDiff));
//         }
//
//         function average(data) {
//           var sum = 0;
//           data.forEach(function (d) {
//             sum = sum + parseFloat(d);
//           });
//           return parseFloat(sum / data.length);
//         }
//
//         // line function
//         var line = d3.svg.line()
//                   .x(function(d) { return xScale(d[0]); })
//                   .y(function(d) { return yScale(d[1]); });
//
//         // Axis
//         svg.append("svg:g")
//           .attr("class", "x axis")
//           .attr("transform", "translate(0," + (height - margin.bottom) + ")")
//           .call(xAxis)
//           .style("text-anchor", "end")
//         svg.append("svg:g")
//           .attr("class", "y axis")
//           .attr("transform", "translate(" + (margin.left) + "," + (margin.top - margin.bottom) + ")")
//           .call(yAxis);
//
//         svg.append("text")
//             .attr("class","mainTitle")
//             .attr("x",20)
//             .attr("y",25)
//             .attr("font-size", "20px")
//             .text(chartTitle);
//         svg.append("text")
//             .attr("class","subTitle")
//             .attr("x",20)
//             .attr("y",40)
//             .attr("font-size", "10px")
//             .text(chartSubtitle);
//
//         // histogram
//         svg.selectAll("rect")
//             .data(d).enter()
//             .append("rect")
//             .attr("class", "bar")
//             .style({
//               fill: "#f1f1f1"
//             })
//             .attr("stroke", irsBlue)
//             .attr("x", function(d) { return xScale(d.x) + 1; })
//             .attr("y", function(d) { return yScale(d.y); })
//             .attr("width", xScale(d[0].dx) - xScale(d[0].x) - 1)
//             .attr("height", function(d) { return height - yScale(d.y) - margin.top; });
//
//         // svg.append("path")
//         //     .datum(kde(data.values))
//         //     .attr("class", "line")
//         //     .attr("d", line);
//
//         // // Grid
//         svg.append("g")
//           .attr("class", "grid")
//           .attr("transform", "translate(" + margin.left + "," + (margin.top - margin.bottom) + ")")
//           .call(yAxis
//             .tickSize(-(width - margin.left - margin.right), 0, 0)
//             .tickFormat(""));
//       };
//     }
//   };
// }])
.directive('d3DensityLinePlot', ['d3', function (d3) {
  return {
    restrict: 'EA',
    scope: {
      data: "=",
      label: "@",
    },
    link: function (scope, iElement, iAttrs) {
      // create the svg to contain our visualization
      var svg = d3.select(iElement[0])
        .append("svg")
        .attr("width", "100%");

      // make the visualization responsive by watching for changes in window size
      window.onresize = function () {
        return scope.$apply();
      };
      scope.$watch(function () {
        return angular.element(window)[0].innerWidth;
      }, function () {
        return scope.render(scope.data);
      });

      // watch the data source for changes to dynamically update the visualization
      scope.$watch('data', function (newData, oldData) {
        return scope.render(newData);
      }, true);

      scope.render = function (data) {
        // clear out everything in the svg to render a fresh version
        svg.selectAll("*").remove();

        // set up variables
        var width, height, max;
        width = d3.select(iElement[0])[0][0].offsetWidth;
        height = 220;
        svg.attr('height', height);
        svg.attr('width', width);

        var irsBlue = 'rgb(82, 154, 189)';

        // define data
        var xLabels = []; // x values
        var yValues = []; // y values
        var charTitle, chartSubtitle;

        // console.log(data);

        data.x_values_bp.forEach(function(d){
          xLabels.push(d);
        });

        data.y_values_bp.forEach(function(d){
          yValues.push(parseFloat(d));
        });

        // create X axis for bars
        var xLabelsBars = [];
        for (i=0; i < xLabels.length - 1; i ++) {
          xLabelsBars[i] = parseFloat(((xLabels[i+1] - xLabels[i])/2)) + parseFloat(xLabels[i]);
        }

        // line
        // var lineData = data.line;
        // console.log(lineData);

        // naming graphics
        chartTitle = data.param;
        chartSubtitle = data.type;
        if(chartSubtitle === "i") {
          chartSubtitle = "integer";
        } else if(chartSubtitle === "r") {
          chartSubtitle = "real";
        }

        // BARs scale X and Y
        var maxValue = d3.max(yValues);
        var margins = {top: 50, right: 50, bottom: 50, left: 70 };

        var yScale = d3.scale.linear().range([height - margins.top, margins.bottom])
            .domain([0, maxValue])
            .nice()
            // y Axis
          yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
        var xScale = d3.scale.ordinal()
            // .domain(xLabels)
            .domain(xLabelsBars)
            .rangeRoundBands([margins.left, width - margins.right], .1),
            // x Axis
          xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");

        // Axis
        svg.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height - margins.bottom) + ")")
          .call(xAxis)
          .style("text-anchor", "end")
        svg.append("svg:g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + (margins.left) + "," + (margins.top - margins.bottom) + ")")
          .call(yAxis);

        // Grid
        svg.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(" + margins.left + "," + (margins.top - margins.bottom) + ")")
          .call(yAxis
            .tickSize(-(width - margins.left - margins.right), 0, 0)
            .tickFormat(""));

        svg.append("text")
          .attr("class","mainTitle")
          .attr("x",20)
          .attr("y",25)
          .attr("font-size", "20px")
          .text(chartTitle);
        svg.append("text")
          .attr("class","subTitle")
          .attr("x",20)
          .attr("y",40)
          .attr("font-size", "10px")
          .text(chartSubtitle);

        //create the bars
        svg.selectAll("rect")
            .data(yValues).enter()
            .append("rect")
            .style({
              fill: "#f1f1f1"
            })
            // set initial dimensions of the bar
            .attr("width", function(){return xScale.rangeBand();})
            .attr("x", function(d,i) { return xScale(xLabelsBars[i]);}) // position bar
            .attr("y", function(d,i) { return (yScale(d)); })
            .attr("height", function(d,i) { return height - yScale(d) - margins.top; })
            .attr("stroke", irsBlue);


      };
    }
  };
}])
.directive('linearChart', ['d3', function (d3) {
    return {
      restrict:'EA',
      scope: {
				data: "=",
			},
      link: function(scope, iElement, attrs) {
              // create the svg to contain our visualization
      				var svg = d3.select(iElement[0])
      					.append("svg")
      					.attr("width", "100%");

              window.onresize = function () {
  					           return scope.$apply();
  				            };

              scope.$watch('data', function (newData, oldData) {
      					return scope.render(newData);
      				}, true);

              scope.render = function (data) {
      					// clear out everything in the svg to render a fresh version
      					svg.selectAll("*").remove();

      					// set up variables
      					var width, height, max;
      					width = d3.select(iElement[0])[0][0].offsetWidth;
                height = 250;
      					max = 100;
      					svg.attr('height', height);

      					var MARGINS = {
      							top: 20,
      							right: 20,
      							bottom: 20,
      							left: 50
      						},
      						xScale = d3.scale.linear()
                      // .range([MARGINS.left, width - MARGINS.right])
                      // TODO review domain when first time entering here
                      .domain([data[0].t, data[data.length-1].t])
                      .range([MARGINS.left,width - MARGINS.right]),
      						yScale = d3.scale.linear()
                      .range([height - MARGINS.top, MARGINS.bottom])
                      .domain([0, 1]),
      						xAxis = d3.svg.axis()
      							      .scale(xScale),
      						yAxis = d3.svg.axis()
      							      .scale(yScale)
      							      .orient("left");

      					  svg.append("svg:g")
        						.attr("class", "x axis")
        						.attr("transform", "translate(0," + (height - MARGINS.bottom) + ")")
        						.call(xAxis);
        					svg.append("svg:g")
        						.attr("class", "y axis")
        						.attr("transform", "translate(" + (MARGINS.left) + ",0)")
        						.call(yAxis);

        					var lineGen = d3.svg.line()
            						.x(function (d) {
            							return xScale(d.t);
            						})
            						.y(function (d) {
            							return yScale(d.v);
            						});
        					svg.append('svg:path')
        						.attr('d', lineGen(data))
        						.attr('stroke', 'rgb(82, 154, 189)')
        						.attr('stroke-width', 1)
        						.attr('fill', 'none');

				};
      }
     };
  }])
  ;
