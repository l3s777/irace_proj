app.factory('d3', [function () {
  var d3 = require('d3');
  return d3;
}]).directive('d3ParallelCoordinatesPlot', ['d3', function (d3) {
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
}]);
