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
          var now = new Date();

          // d3 objects:
          var space, earthOrbitPosition, moonOrbitPosition;

          // define render function
          scope.render = function(data){
            calendarData = data.getData();
            var buildCanvas = function(startDate){
              startDate = startDate || now;
              width = $window.innerWidth;
              height = $window.innerHeight;
              radius = Math.min(width, height);

              radii = {
                "sun": radius / 8,
                "earthOrbit": radius / 2.5,
                "earth": radius / 32,
                "moonOrbit": radius / 16,
                "moon": radius / 96
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
                .attr("transform", "translate(0," + -radii.earthOrbit + ")")
                .style("fill", "rgba(113, 170, 255, 1.0)");

              // Moon's orbit
              space.append("circle")
                .attr("class", "moonOrbit")
                .attr("r", radii.moonOrbit)
                .attr("transform", "translate(0," + -radii.earthOrbit + ")")
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
                .attr("transform", "translate(0," + -radii.earthOrbit + ")")
                .style("fill", "rgba(113, 170, 255, 0.75)");

              // Moon
              space.append("circle")
                .attr("class", "moon")
                .attr("r", radii.moon)
                .attr("transform", "translate(0," + (-radii.earthOrbit + -radii.moonOrbit) + ")")
                .style("fill", "rgba(150, 150, 150, 1.0)");

              // Moon Orbit Line
              moonOrbitLine = d3.svg.line()
                .x(function(d){
                  return radii.earthOrbit * Math.sin( Math.PI * 2 * d.earthPhase ) +
                  radii.moonOrbit * Math.sin(Math.PI * 2 * d.moonPhase + Math.PI + Math.PI * 2 * d.earthPhase); })
                .y(function(d){ return -radii.earthOrbit * Math.cos( Math.PI * 2 * d.earthPhase ) +
                  -radii.moonOrbit * Math.cos( Math.PI * 2 * d.moonPhase + Math.PI + Math.PI * 2 * d.earthPhase); });
              space.append('path')
                .attr("d", moonOrbitLine(calendarData))
                .attr("stroke-dasharray", "10,5,5,5")
                .style("fill", "none")
                .style("stroke", "rgba(150, 150, 150, 0.25)");
            };


            // remove all previous items before render
            svg.selectAll("*").remove();
            buildCanvas();

            var totalDaysInYear = d3.time.days(d3.time.year.floor(now),
              d3.time.year.ceil(now)).length;

            var hoursSinceYearStarted = d3.time.hours(d3.time.year.floor(now), now).length;
            var totalHoursInYear = totalDaysInYear * 24;
            var fractionOfYear = hoursSinceYearStarted / totalHoursInYear;
            var interpolateEarthOrbitPosition = d3.interpolate(earthOrbitPosition.endAngle()(),
              (2 * Math.PI * fractionOfYear));

            var earthOrbitPositionToDate = function() {
              // TODO add a year parameter that defaults to this year
              var day = earthOrbitPosition.endAngle()() / (2 * Math.PI) * totalDaysInYear;
              var date = d3.time.year.floor(now);
              date.setDate(date.getDate() + day);
              return date;
            };


            var dateToRadians = function(date){
              date = date || now;

              var dateYear = d3.time.year.floor(date);
              var nextDateYear = (new Date(dateYear)).setFullYear(dateYear.getFullYear() + 1);

              var numDaysInYear = d3.time.days(dateYear, nextDateYear).length;
              var numDaysFromStartOfYearTillDate = d3.time.days(dateYear, date).length;
              var currentYear = d3.time.year.floor(now);

              return (numDaysFromStartOfYearTillDate / numDaysInYear) * 2 * Math.PI;
            };

            var setEarthOrbitPositionWithDate = function(date){
                setEarthOrbitPositionWithRadians(dateToRadians(date));
            };

            var setEarthOrbitPositionWithRadians = function(radians){
              // Transition the wide part of the orbit
              d3.select(".earthOrbitPosition")
                .attr("d", earthOrbitPosition.endAngle(radians));

              // Transition the Earth itself
              d3.select(".earth")
                .attr("transform", "translate(" +
                  radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) + "," +
                  -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) + ")");


              // Transition Moon orbit
              d3.select(".moonOrbit")
                .attr("transform", "translate(" +
                  radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) +
                  "," +
                  -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) +
                  ")");

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
                  .attr("transform", "translate(" +
                    (radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) +
                      radii.moonOrbit * Math.sin(moonOrbitPosition.endAngle()())) +
                    "," +
                    (-radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) +
                     -radii.moonOrbit * Math.cos(moonOrbitPosition.endAngle()())) +
                    ")");
              };

            setEarthOrbitPositionWithRadians(0);

            setEarthOrbitPositionWithDate(calendarData[10].greg());

            d3.transition().duration(20000).tween("orbit", function () {
              return function (t) {
                // Animate Earth orbit position
                setEarthOrbitPositionWithRadians(interpolateEarthOrbitPosition(t));
              };
           });
          };
        }
      };
    }]);
