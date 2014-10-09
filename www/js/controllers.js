angular.module('starter.controllers', ['importedFactories'])
.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', ['$scope', 'd3',function($scope, d3) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
}])

.controller('PlaylistCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {
}])
.controller('CalendarCtrl', ['$scope', '$window', 'd3', 'hebcal', 'suncalc',
  function($scope, $window, d3, hebcal, suncalc){
  // intially set background so we don't fade from black
  d3.select('.calendar-screen')
    .style('background-color', function() {
      return '#222222';
      //return 'hsl(' + (Math.random() * 360) + ',70%,90%)';
  });

  // // Slowly change background color
  // // subtle little animation.
  // setInterval(function(){
  //     d3.select('.calendar-screen')
  //       .transition()
  //       .duration(3000)
  //       .style('background-color', function() {
  //         return 'hsl(' + (Math.random() * 360) + ',70%,90%)';
  //       });
  // }, 5000);

  /// *** ///
  var width = $window.innerWidth,
     height = $window.innerHeight;


  // This seems like an overkill way of saying
  // january 1st 2014 (wed)
  var now = new Date(d3.time.year.floor(new Date()));

  var spacetime = d3.select('.calendar-screen');
  var radius = Math.min(width, height);

  var radii = {
    "sun": radius / 8,
    "earthOrbit": radius / 2.5,
    "earth": radius / 32,
    "moonOrbit": radius / 16,
    "moon": radius / 96
  };

  // Space
  var svg = spacetime.append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // Sun
  svg.append("circle")
    .attr("class", "sun")
    .attr("r", radii.sun)
    .style("fill", "rgba(255, 204, 0, 1.0)");

  // Earth's orbit
  svg.append("circle")
    .attr("class", "earthOrbit")
    .attr("r", radii.earthOrbit)
    .style("fill", "none")
    .style("stroke", "rgba(255, 204, 0, 0.25)");

  // Current position of Earth in its orbit
  var earthOrbitPosition = d3.svg.arc()
    .outerRadius(radii.earthOrbit + 1)
    .innerRadius(radii.earthOrbit - 1)
    .startAngle(0)
    .endAngle(0);
  svg.append("path")
    .attr("class", "earthOrbitPosition")
    .attr("d", earthOrbitPosition)
    .style("fill", "rgba(255, 204, 0, 0.75)");

  // Earth
  svg.append("circle")
    .attr("class", "earth")
    .attr("r", radii.earth)
    .attr("transform", "translate(0," + -radii.earthOrbit + ")")
    .style("fill", "rgba(113, 170, 255, 1.0)");

  // Time of day
  var day = d3.svg.arc()
    .outerRadius(radii.earth)
    .innerRadius(0)
    .startAngle(0)
    .endAngle(0);
  svg.append("path")
    .attr("class", "day")
    .attr("d", day)
    .attr("transform", "translate(0," + -radii.earthOrbit + ")")
    .style("fill", "rgba(53, 110, 195, 1.0)");

  // Moon's orbit
  svg.append("circle")
    .attr("class", "moonOrbit")
    .attr("r", radii.moonOrbit)
    .attr("transform", "translate(0," + -radii.earthOrbit + ")")
    .style("fill", "none")
    .style("stroke", "rgba(113, 170, 255, 0.25)");

  // Current position of the Moon in its orbit
  var moonOrbitPosition = d3.svg.arc()
    .outerRadius(radii.moonOrbit + 1)
    .innerRadius(radii.moonOrbit - 1)
    .startAngle(0)
    .endAngle(0);
  svg.append("path")
    .attr("class", "moonOrbitPosition")
    .attr("d", moonOrbitPosition(now))
    .attr("transform", "translate(0," + -radii.earthOrbit + ")")
    .style("fill", "rgba(113, 170, 255, 0.75)");

  // Moon
  svg.append("circle")
    .attr("class", "moon")
    .attr("r", radii.moon)
    .attr("transform", "translate(0," + (-radii.earthOrbit + -radii.moonOrbit) + ")")
    .style("fill", "rgba(150, 150, 150, 1.0)");

  // Update the clock every second
  setTimeout(function () {

    now = new Date();
    var totalDaysInYear = d3.time.days(d3.time.year.floor(now),
      d3.time.year.ceil(now)).length;

    var hoursSinceYearStarted = d3.time.hours(d3.time.year.floor(now), now).length;
    var totalHoursInYear = d3.time.hours(d3.time.year.floor(now),
      d3.time.year.ceil(now)).length;
    var fractionOfYear = hoursSinceYearStarted / totalHoursInYear;
    var interpolateEarthOrbitPosition = d3.interpolate(earthOrbitPosition.endAngle()(), (2 * Math.PI * fractionOfYear));

    var secondsSinceDayStarted = d3.time.seconds(d3.time.day.floor(now), now).length;
    var totalSecondsInDay = d3.time.seconds(d3.time.day.floor(now), d3.time.day.ceil(now)).length;
    var fractionOfDay = secondsSinceDayStarted / totalSecondsInDay;
    var interpolateDay = d3.interpolate(day.endAngle()(), (2 * Math.PI * fractionOfDay));

    var hoursSinceMonthStarted = d3.time.hours(d3.time.month.floor(now), now).length;
    var totalHoursInMonth = d3.time.hours(d3.time.month.floor(now), d3.time.month.ceil(now)).length;
    var fractionOfMonth = hoursSinceMonthStarted / totalHoursInMonth;
    var interpolateMoonOrbitPosition = d3.interpolate(moonOrbitPosition.endAngle()(), (2 * Math.PI * fractionOfMonth));

    var dateOfEarthPostion = function() {
      var day = earthOrbitPosition.endAngle()() / (2 * Math.PI) * totalDaysInYear;
      var date = d3.time.year.floor(new Date());
      date.setDate(date.getDate() + day);
      return date;
    };

    d3.transition().duration(10000).tween("orbit", function () {
      return function (t) {
        // Animate Earth orbit position
        d3.select(".earthOrbitPosition")
          .attr("d", earthOrbitPosition.endAngle(interpolateEarthOrbitPosition(t)));

        // Transition Earth
        d3.select(".earth")
          .attr("transform", "translate(" +
            radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) +
            "," +
            -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) +
            ")");

        // Animate day
        // Transition day
        d3.select(".day")
          .attr("d", day.endAngle(interpolateDay(t)))
          .attr("transform", "translate(" +
            radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) +
            "," +
            -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) +
            ")");

        // Transition Moon orbit
        d3.select(".moonOrbit")
          .attr("transform", "translate(" +
            radii.earthOrbit * Math.sin(earthOrbitPosition.endAngle()()) +
            "," +
            -radii.earthOrbit * Math.cos(earthOrbitPosition.endAngle()()) +
            ")");

        // figure out where moon should be based on date of earths solar year
        var moonPhase = SunCalc.getMoonIllumination(dateOfEarthPostion()).phase * 2 * Math.PI;

        // rotate moon orbit start to be radial with eart / sun so new moon is
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
    });
  }, 1000);

}]);
