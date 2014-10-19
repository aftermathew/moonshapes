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
              day.relativeMoonPhase = lastRelativeMoonPhase + moonDiff;
            } else {
              // we've gone a full cycle.
              day.relativeMoonPhase = lastRelativeMoonPhase + day.moonPhase + (1 - lastMoonPhase);
            }
          } else {
            day.relativeMoonPhase = day.moonPhase;
          }

          lastMoonPhase = day.moonPhase;
          lastRelativeMoonPhase = day.relativeMoonPhase;
        })
        .valueOf();
    };

    var addEarthPhaseToData = function(data){
      return _.chain(data)
        .forEach(function(day, i){

          var year = day.greg().getFullYear();
          if(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
              // Leap year
              year = 365;
          } else {
              // Not a leap year
              year =  366;
          }

          day.earthPhase = d3.time.dayOfYear(day.greg()) / year;
        })
        .valueOf();
    };

    this.buildData = function(startDate, endDate){
      return addEarthPhaseToData(addMoonPhasesToData(makeDataLunar(d3.time.days(startDate, endDate))));
    };

    this.buildSolarYear = function(yearDate){
      // default to this year
      dateyear = yearDate || new Date();
      dateYear = d3.time.year.floor(dateyear);
      var nextDateYear = (new Date(dateYear)).setFullYear(dateYear.getFullYear() + 1);

      return this.buildData(dateYear, nextDateYear);
    };


    this.buildSolarDecade = function(yearDate){
      // default to this year
      dateyear = yearDate || new Date();
      dateYear = d3.time.year.floor(dateyear);
      dateYear.setFullYear(dateYear.getFullYear() - 5);
      var lateDateYear = (new Date(dateYear)).setFullYear(dateYear.getFullYear() + 10);

      return this.buildData(dateYear, lateDateYear);
    };

    this.getData = function(){
      return data;
    };


    function daysBetweenDates(first, second) {
      return Math.floor((first - second)/(1000*60*60*24));
    }

    this.findNearestDateIndex = function(date){
      var days = daysBetweenDates(date, data[0].greg());

      if(days <= 0){
        return 0;
      } else if (days >= data.length){
        return data.length;
      }

      // this seem like you wouldn't need it, but we seem to have
      // an off by one error sometimes, so here you go
      var collection = [
        Math.abs(data[days - 1].greg() - date),
        Math.abs(data[days].greg() - date),
        Math.abs(data[days + 1] - date)
      ];

      return _.indexOf(collection, _.min(collection)) + (days - 1);
    };


    data = this.buildSolarDecade();
  }]);
