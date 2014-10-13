angular.module('calendarData', ['importedFactories'])
  .service('calendarDataService', ['d3', 'hebcal', 'suncalc', function(d3, hebcal, suncalc) {
    var data;
    var that = this;

    Hebcal.events.on('ready', function(){
      // TODO add localization data when it comes in
      // rebuilding like this is dumb, but it's just POC for now.
      //data = that.buildData(data[0].greg(), data[data.length - 1].greg());
    });

    var makeDataLunar = function(days){
      return _.map(days, function(day){
        return hebcal.HDate(day);
      });
    };

    var addMoonPhasesToData = function(data){
      var lastMoonPhase, lastRelativeMoonPhase;
      return _.chain(data)
        .forEach(function(day, i){
          // use gregorian data if in lunar day
          var date = (day.greg && day.greg()) || day;

          day.moonPhase = suncalc.getMoonIllumination(date).phase;
          if(i > 0){
            var moonDiff = day.moonPhase - lastMoonPhase;
            if(moonDiff >= 0){
              day.relativeMoonPhase = lastRelativePhase + diffMoon;
            } else {
              // we've gone a full cycle.
              day.relativeMoonPhase = lastRelativeMoonPhase + day.moonPhase + (1 - lastMoonPhase);
            }
          } else {
            day.relativeMoonPhase = day.moonPhase;
          }

          lastPhase = day.moonPhase;
          lastRelativePhase = day.relativeMoonPhase;
        })
        .valueOf();
    };

    var addEarthPhaseToData = function(data){
      return _.chain(data)
        .forEach(function(day, i){
          day.earthPhase = i/data.length;
        })
        .valueOf();
    };

    this.buildData = function(startDate, endDate){
      return addEarthPhaseToData(addMoonPhasesToData(makeDataLunar(d3.time.days(startDate, endDate))));
    };

    this.buildSolarYear = function(yearDate){
      // default to this year
      yearDate = yearDate || new Date();
      return this.buildData(d3.time.year.floor(yearDate), d3.time.year.ceil(yearDate));
    };

    this.getData = function(){
      return data;
    };

    data = this.buildSolarYear();
  }]);
