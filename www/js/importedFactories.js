angular.module('importedFactories', [])
  .factory('d3', function() {
    return window.d3;
  })
  .factory('hebcal', function(){
    return window.Hebcal;
  })
  .factory('suncalc', function(){
    return window.SunCalc;
  });
