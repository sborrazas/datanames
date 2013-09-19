jQuery(function ($) {

  var NAMES_BASE_URL = "/names/"
    , YEARS_BASE_URL = "/years/"
    , MIN_YEAR = 1960
    , MAX_YEAR = 2010
    , statisticsCalculator = {}
    , DataProcessor = function (name, year) {
      this.name = name;
      this.processedName = this._processName(name);
      this.year = this._processYear(year);
    };

  /**
   *
   */
  DataProcessor.prototype.fetchData = function (callback) {
    var nameDone = false
      , yearDone = ! this.year
      , $processing = new $.Deferred()
      , checkDone, nameData, yearData;

    if (this.processedName === "") {
      $processing.reject({ type: "invalid_name" });
      return $processing;
    }

    checkDone = function () {
      if (nameDone && yearDone) {
        $processing.resolve({
          name: this.name,
          processedName: this.processedName,
          year: this.year,
          nameData: nameData,
          yearData: yearData,
          statistics: this._fetchStatistics(nameData, yearData)
        });
      }
    }.bind(this);

    this._fetchNameData().done(function (nameDataResponse) {
      nameDone = true;
      nameData = nameDataResponse;
      checkDone();
    }).fail(function () {
      $processing.reject({ type: "name_not_found" });
    });

    if (!yearDone) {
      this._fetchYearData().done(function (yearDataResponse) {
        yearDone = true;
        yearData = yearDataResponse;
        checkDone();
      }).fail(function () {
        $processing.reject({ type: "year_not_found" });
      });
    }

    return $processing;
  };

  /**
   *
   */
  DataProcessor.prototype._fetchNameData = function () {
    return $.ajax({
      url: NAMES_BASE_URL + this.processedName + ".json",
      method: "GET",
      dataType: "json"
    });
  };

  /**
   *
   */
  DataProcessor.prototype._fetchYearData = function () {
    return $.ajax({
      url: YEARS_BASE_URL + this.year + ".json",
      method: "GET",
      dataType: "json"
    });
  };

  /**
   *
   */
  DataProcessor.prototype._processName = function (name) {
    var replacements = [
      [/[^\sa-zA-Z\d]+/g, " "],
      [/\s+/g, "_"],
      [/^_+/, ""],
      [/_+$/, ""]
    ]
    , length = replacements.length
    , i = 0;

    name = name.toLowerCase();

    for (; i < length; i += 1) {
      name = name.replace(replacements[i][0], replacements[i][1]);
    }

    return name;
  };

  /**
   *
   */
  DataProcessor.prototype._processYear = function (yearStr) {
    var year = parseInt(yearStr, 10);

    if (year >= 0) {
      return year;
    }
    else {
      return null;
    }
  };

  /**
   *
   */
  DataProcessor.prototype._fetchStatistics = function (nameData) {
    var statistics = [];

    statistics.push(statisticsCalculator.totalNames(this.name, nameData));
    statistics.push(statisticsCalculator.yearsWithName(this.name, nameData));
    statistics.push(statisticsCalculator.minYear(this.name, nameData));
    statistics.push(statisticsCalculator.maxYear(this.name, nameData));

    return statistics;
  };

  /**
   *
   */
  statisticsCalculator.totalNames = function (name, nameData) {
    var totalQuantity = 0
    , length = nameData.length
    , i = 0;

    for (; i < length; i += 1) {
      totalQuantity += nameData[i].quantity;
    }

    return {
      title: totalQuantity,
      description: name + " en total"
    };
  };

  /**
   *
   */
  statisticsCalculator.maxYear = function (name, nameData) {
    var maxYear = 1960
      , maxYearNumber = 0
      , length = nameData.length
      , i = 0;

    for (; i < length; i += 1) {
      if (nameData[i].quantity > maxYearNumber) {
        maxYear = nameData[i].year;
        maxYearNumber = nameData[i].quantity;
      }
    }

    return {
      title: maxYear,
      description: "es el a&ntilde;o con m&aacute;s " + name
    };
  };

  /**
   *
   */
  statisticsCalculator.minYear = function (name, nameData) {
    var minYear = MIN_YEAR
      , minYearNumber = 9999999
      , length = nameData.length
      , year, quantity, i;

    for (year = MIN_YEAR; year <= MAX_YEAR; year += 1) {
      quantity = 0;
      for (i = 0; i < nameData.length; i += 1) {
        if (nameData[i].year == year) {
          quantity = nameData[i].quantity;
        }
      }
      if (quantity < minYearNumber) {
        minYear = year;
        minYearNumber = quantity;
      }
    }

    return {
      title: minYear,
      description: "es el a&ntilde;o con menos " + name
    };
  };

  /**
   *
   */
  statisticsCalculator.yearsWithName = function (name, nameData) {
    var yearsWithName = nameData.length
    , yearsWithoutName;

    yearsWithoutName = (MAX_YEAR - MIN_YEAR + 1) - yearsWithName;

    return {
      title: yearsWithoutName,
      description: "a&ntilde;os sin " + name
    };
  };

  window.DataProcessor = DataProcessor;

});
