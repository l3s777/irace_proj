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
          console.log("at changing data");
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
  							})
  							.call(d3.behavior.drag()
  								.origin(function (d) {
  									return {x: x(d)};
  								})
  								.on("dragstart", function (d) {
  									dragging[d] = x(d);
  									background.attr("visibility", "hidden");
  								})
  								.on("drag", function (d) {
  									dragging[d] = Math.min(width, Math.max(0, d3.event.x));
  									foreground.attr("d", path);
  									dimensions.sort(function (a, b) {
  										return position(a) - position(b);
  									});
  									x.domain(dimensions);
  									g.attr("transform", function (d) {
  										return "translate(" + position(d) + ")";
  									})
  								})
  								.on("dragend", function (d) {
  									delete dragging[d];
  									transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
  									transition(foreground).attr("d", path);
  									background
  										.attr("d", path)
  										.transition()
  										.delay(500)
  										.duration(0)
  										.attr("visibility", null);
  								}));

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

      // TODO redo each line

			// watch the data source for changes to dynamically update the visualization
			scope.$watch('data', function (newData, oldData) {
				return scope.render(newData);
			}, true);

			scope.render = function (data) {
				// clear out everything in the svg to render a fresh version
				svg.selectAll("*").remove();

				// set up variables
				var width, height, max;
				// width = d3.select(iElement[0])[0][0].offsetWidth;
        width = 1000;
				height = 700;
				svg.attr('height', height);
				svg.attr('width', width);

				var irsBlue = 'rgb(82, 154, 189)';

				var yMax = -Infinity,
					yMin = Infinity;
				var xValues = [];
				xValues.push(' ');
				data.forEach(function (d, index) {
					xValues.push(index+1);
					d.forEach(function(p) {
						if(p > yMax) yMax = p;
						if(p < yMin) yMin = p;
					})
				});
				xValues.push('\t');

				var margins = {top: 50, right: 100, bottom: 50, left: 100 },
					yScale = d3.scale.linear().range([height - margins.top, margins.bottom])
						.domain([yMin*0.998, yMax*1.002]),
					yAxis = d3.svg.axis()
						.scale(yScale)
						.orient("left"),
					xScale = d3.scale.ordinal()
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
					.selectAll("text")
					.style("text-anchor", "end")
				svg.append("svg:g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + (margins.left) + "," + (margins.top - margins.bottom) + ")")
					.call(yAxis);

				var bar_width = 15;

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

        // TODO
        var min_value = [];
				data.forEach(function(iteration, index) {
					var val = yScale(iteration[0]);
					var bar_x = xScale(index+1) - bar_width/2;
					var values = computeValues(iteration);
					min = values[0];
          // TODO redefine
          min_value.push(min);
					max = values[1];
					mid = values[2];
					q25 = values[3];
					q75 = values[4];

					// Center line
					svg.append("line")
						.attr("x1", xScale(index+1))
						.attr("y1", yScale(min))
						.attr("x2", xScale(index+1))
						.attr("y2", yScale(max))
						.attr("stroke-width", 1)
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
						.attr("y", yScale(q75)) // (height-margins.bottom) - val
						// finally, set the width of the bar based on the datapoint
						.attr("height", yScale(q25) - yScale(q75))
						.attr("stroke", irsBlue);
					svg.append("line")
						.attr("x1", bar_x)
						.attr("y1", yScale(q75))
						.attr("x2", bar_x+bar_width)
						.attr("y2", yScale(q75))
						.attr("stroke-width", 1)
						.attr("stroke", "black");
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
      					height = scope.data.length * 40;
      					max = 100;
      					svg.attr('height', height);

      					var MARGINS = {
      							top: 20,
      							right: 20,
      							bottom: 20,
      							left: 50
      						},
      						xScale = d3.scale.linear().range([MARGINS.left, width - MARGINS.right]).domain([data[0].t, data[data.length-1].t]),
      						yScale = d3.scale.linear().range([height - MARGINS.top, MARGINS.bottom]).domain([0, 1]),
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
