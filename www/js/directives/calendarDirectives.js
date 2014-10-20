angular.module('calendarDirectives', ['importedFactories'])
    .directive('calendarOrbitalView', ['$window', 'd3', function($window, d3) {
      return {
        restrict: 'EA',
        scope: {
          data: "=",
          label: "@",
          onClick: "&"
        },
        link: function(scope, iElement, iAttrs) {
          // on window resize, re-render d3 canvas
          window.onresize = function() {
            return scope.$apply();
          };
          scope.$watch(function(){
              return angular.element(window)[0].innerWidth;
            }, function(){
              return scope.render(scope.data);
            }
          );
          //
          // // watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

          var svg = d3.select(iElement[0])
              .append("svg");

          var width, height, radius, radii;
          var currentDate = new Date();

          // d3 objects:
          var space, earthOrbitPosition, moonOrbitPosition;

          // define render function
          scope.render = function(data){
            calendarData = data.getData();
            var buildCanvas = function(startDate){
              startDate = startDate || currentDate;
              width = $window.innerWidth;
              height = $window.innerHeight;
              radius = Math.min(width, height);

              radii = {
                "sun": radius / 8,
                "earthOrbit": radius / 2.5,
                "earth": radius / 32,
                "moonOrbit": radius / 16,
                "moon": radius / 96,
                // earth orbit - a little larger than moon orbit
                "months": (radius / 2.5) - (radius / 14)
              };

              // Space
              space = svg.attr("width", width)
                .attr("height", height).append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

              // Sun
              space.append("circle")
                .attr("class", "sun")
                .attr("r", radii.sun)
                .style("fill", "rgba(255, 204, 0, 1.0)");

              // Earth's orbit
              space.append("circle")
                .attr("class", "earthOrbit")
                .attr("r", radii.earthOrbit)
                .style("fill", "none")
                .style("stroke", "rgba(255, 204, 0, 0.25)");

              // Current position of Earth in its orbit
              earthOrbitPosition = d3.svg.arc()
                .outerRadius(radii.earthOrbit + 1)
                .innerRadius(radii.earthOrbit - 1)
                .startAngle(0)
                .endAngle(0);
              space.append("path")
                .attr("class", "earthOrbitPosition")
                .attr("d", earthOrbitPosition)
                .style("fill", "rgba(255, 204, 0, 0.75)");

              // Earth
              space.append("circle")
                .attr("class", "earth")
                .attr("r", radii.earth)
                .attr("cx", 0)
                .attr("cy", -radii.earthOrbit)
                .style("fill", "rgba(113, 170, 255, 1.0)");

              // Moon's orbit
              space.append("circle")
                .attr("class", "moonOrbit")
                .attr("r", radii.moonOrbit)
                .attr("cx", 0)
                .attr("cy", -radii.earthOrbit)
                .style("fill", "none")
                .style("stroke", "rgba(113, 170, 255, 0.25)");

              // Current position of the Moon in its orbit
              moonOrbitPosition = d3.svg.arc()
                .outerRadius(radii.moonOrbit + 1)
                .innerRadius(radii.moonOrbit - 1)
                .startAngle(0)
                .endAngle(0);
              space.append("path")
                .attr("class", "moonOrbitPosition")
                .attr("d", moonOrbitPosition)
                .attr("cx", 0)
                .attr("cy", -radii.earthOrbit)
                .style("fill", "rgba(113, 170, 255, 0.75)");

              // Moon
              space.append("circle")
                .attr("class", "moon")
                .attr("r", radii.moon)
                .attr("cx", 0)
                .attr("cy", (-radii.earthOrbit + radii.moonOrbit))
                .style("fill", "rgba(150, 150, 150, 1.0)");

              // Moon Orbit Line
              var startOfYearIndex = data.findNearestDateIndex(d3.time.year.floor(currentDate));
              var endOfYearIndex = data.findNearestDateIndex(d3.time.year.ceil(currentDate));

              moonData = calendarData.slice(startOfYearIndex, endOfYearIndex);

              var moonOrbitLine = d3.svg.line()
                .x(function(d){
                  return radii.earthOrbit * Math.sin( Math.PI * 2 * d.earthPhase ) +
                  radii.moonOrbit * Math.sin(Math.PI * 2 * d.moonPhase + Math.PI + Math.PI * 2 * d.earthPhase); })
                .y(function(d){ return -radii.earthOrbit * Math.cos( Math.PI * 2 * d.earthPhase ) +
                  -radii.moonOrbit * Math.cos( Math.PI * 2 * d.moonPhase + Math.PI + Math.PI * 2 * d.earthPhase); });
              space.append('path')
                .attr("d", moonOrbitLine(moonData))
                .attr("stroke-dasharray", "10,5,5,5")
                .style("fill", "none")
                .style("stroke", "rgba(150, 150, 150, 0.25)");
            };

            var drawMonths = function(){
              // debugger;
              var color = d3.scale.category20c();
              var dataset = [];
              var solarMonths = data.getSolarYearSolarMonths(currentDate);
              var lunarMonths = data.getSolarYearLunarMonths(currentDate);

              dataset[0] = _.map(solarMonths, function(m){
                return {
                  'length': m.length,
                  'name': m.getName()
                };
              });
              dataset[1] = _.map(lunarMonths, function(m){
                return {
                  'length': m.length,
                  'name': m.getName()
                };
              });

              var pie = d3.layout.pie().sort(null);
              var arc = d3.svg.arc();
              var centroids = [[],[]];

              var months = space.append("g");

              var gs = months.selectAll("g")
                .data(d3.values(dataset))
                .enter()
                .append("g");

              gs.selectAll("path")
                .data(function(d) { return pie(_.pluck(d, 'length')); })
                .enter()
                .append("path")
                .attr("fill", function(d, i, j) { return color(i+ 5*j); })
                .attr("d", function(d, i, j) {
                    var myarc = arc.innerRadius( radii.months - 20 * j)
                      .outerRadius( radii.months -  (20 * j + 10));

                  centroids[j].push(myarc.centroid(d));
                  return myarc(d);
                });

              gs.selectAll("text")
                .data(function(d) { return d; })
                .enter()
                .append("text")
                .attr("transform", function(d, i, j) {
                  return "translate(" + centroids[j][i]+ ")";
                })
                //.attr("stroke", "#000000")
                .attr("fill",  "#FFFFFF")
                .attr("text-anchor", "middle")
                .text(function(d,i,j) {
                  return d.name;
                });
            };

            // remove all previous items before render
            svg.selectAll("*").remove();
            buildCanvas();

            var totalDaysInYear = d3.time.days(d3.time.year.floor(currentDate),
              d3.time.year.ceil(currentDate)).length;

            var hoursSinceYearStarted = d3.time.hours(d3.time.year.floor(currentDate), currentDate).length;
            var totalHoursInYear = totalDaysInYear * 24;
            var fractionOfYear = hoursSinceYearStarted / totalHoursInYear;
            var interpolateEarthOrbitPosition = d3.interpolate(earthOrbitPosition.endAngle()(),
              (2 * Math.PI * fractionOfYear));

            var earthOrbitPositionToDate = function() {
              // TODO add a year parameter that defaults to this year
              var day = earthOrbitPosition.endAngle()() / (2 * Math.PI) * totalDaysInYear;
              var date = d3.time.year.floor(currentDate);
              date.setDate(date.getDate() + day);
              return date;
            };


            var dateToRadians = function(date){
              date = date || currentDate;

              var dateYear = d3.time.year.floor(date);
              var nextDateYear = (new Date(dateYear)).setFullYear(dateYear.getFullYear() + 1);

              var numDaysInYear = d3.time.days(dateYear, nextDateYear).length;
              var numDaysFromStartOfYearTillDate = d3.time.days(dateYear, date).length;
              var currentYear = d3.time.year.floor(currentDate);

              return (numDaysFromStartOfYearTillDate / numDaysInYear) * 2 * Math.PI;
            };

            var setEarthOrbitPositionWithDate = function(date){
                setEarthOrbitPositionWithIndex(data.findNearestDateIndex(date));
            };

            var setEarthOrbitPositionWithIndex = function(index){
                // Transition the wide part of the orbit
                d3.select(".earthOrbitPosition")
                  .attr("d", earthOrbitPosition.endAngle(calendarData[index].earthPhase * 2* Math.PI));

                // Transition the Earth itself
                d3.select(".earth")
                  .attr("cx", radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()))
                  .attr("cy", -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()));

                // Transition Moon orbit
                d3.select(".moonOrbit")
                  .attr("cx", radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()))
                  .attr("cy", -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()));

                  //figure out where moon should be based on date of earths solar year
                  console.log(calendarData[index]);
                  var moonPhase = calendarData[index].relativeMoonPhase;
                  moonPhase = moonPhase * 2 * Math.PI;

                  // rotate moon orbit start to be radial with earth / sun so new moon is
                  // always between earth and sun, and full moon is always in line with them
                  moonOrbitPosition.startAngle(earthOrbitPosition.endAngle()() + Math.PI);

                  // Animate Moon orbit position
                  // Transition Moon orbit position
                  d3.select(".moonOrbitPosition")
                    .attr("d", moonOrbitPosition.endAngle(moonPhase + moonOrbitPosition.startAngle()()))
                    .attr("cx",radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()))
                    .attr("cy",-radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()));
                  // Transition Moon
                  d3.select(".moon")
                    .attr("cx",
                      (radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) +
                       radii.moonOrbit * Math.sin(moonOrbitPosition.endAngle()())))
                    .attr("cy",
                      (-radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) +
                       -radii.moonOrbit * Math.cos(moonOrbitPosition.endAngle()())));
              };

            var setEarthOrbitPositionWithRadians = function(radians){
              // Transition the wide part of the orbit
              d3.select(".earthOrbitPosition")
                .attr("d", earthOrbitPosition.endAngle(radians));

              // Transition the Earth itself
              d3.select(".earth")
                .attr("cx", radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()))
                .attr("cy", -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()));

              // Transition Moon orbit
              d3.select(".moonOrbit")
                .attr("cx", radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()))
                .attr("cy", -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()));

                //figure out where moon should be based on date of earths solar year
                var moonPhase = SunCalc.getMoonIllumination(earthOrbitPositionToDate()).phase * 2 * Math.PI;

                // rotate moon orbit start to be radial with earth / sun so new moon is
                // always between earth and sun, and full moon is always in line with them
                moonOrbitPosition.startAngle(earthOrbitPosition.endAngle()() + Math.PI);

                // Animate Moon orbit position
                // Transition Moon orbit position
                d3.select(".moonOrbitPosition")
                  .attr("d", moonOrbitPosition.endAngle(moonPhase + moonOrbitPosition.startAngle()()))
                  .attr("transform", "translate(" +
                    radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) +
                    "," +
                    -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) +
                    ")");

                // Transition Moon
                d3.select(".moon")
                  .attr("cx",
                    (radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) +
                      radii.moonOrbit * Math.sin(moonOrbitPosition.endAngle()())))
                  .attr("cy",
                    (-radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) +
                     -radii.moonOrbit * Math.cos(moonOrbitPosition.endAngle()())));
            };

            setEarthOrbitPositionWithRadians(0);

            drawMonths();
            d3.transition().duration(10000).tween("orbit", function () {
              return function (t) {
                // Animate Earth orbit position
                setEarthOrbitPositionWithRadians(interpolateEarthOrbitPosition(t));
              };
           });
          };
        }
      };
    }]);
