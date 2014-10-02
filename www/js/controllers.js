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

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
.controller('CalendarCtrl', function($scope, $window, d3, hebcal){
  console.log(new Hebcal());

  // intially set background so we don't fade from black
  d3.select('.calendar-screen')
    .style('background-color', function() {
      return 'hsl(' + (Math.random() * 360) + ',70%,90%)';
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

  var dataset = {
    apples: [2, 4, 8, 16, 32],
    oranges: [53245, 28479, 19697, 24037, 40245],
    lemons: [53245, 28479, 19697, 24037, 40245],
    months: _.map(Hebcal().months, function(month){ return month.days.length; })
  };

  var width = $window.innerWidth,
      height = $window.innerHeight,
      cwidth = 25;

  var color = d3.scale.category20c();

  var pie = d3.layout.pie().sort(null);
  var arc = d3.svg.arc();

  var svg = d3.select(".calendar-screen")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var gs = svg.selectAll("g")
    .data(d3.values(dataset))
    .enter()
    .append("g");

  var centroids = [];

  gs.selectAll("path")
    .data(function(d) { return pie(d); })
    .enter()
    .append("path")
    .attr("fill", function(d, i) { return color(i); })
    .attr("d", function(d, i, j) {
        var myarc = arc.innerRadius( 18 + cwidth * j * 2)
          .outerRadius( cwidth * (2 * j + 1));

      centroids.push(myarc.centroid(d));
      return myarc(d);
    });

  gs.selectAll("text")
    .data(function(d) { return d; })
    .enter()
    .append("text")
    .attr("transform", function(d, i, j) {
      return "translate(" + centroids[i + j * 5]+ ")";
    })
//    .attr("stroke", "#000000")
    .attr("fill",  "#000000")
    .attr("text-anchor", "middle")
    .text(function(d,i,j) {
      if(j === 3)
        return new Hebcal().months[i].getName();
      else
        return d;
    });

});
