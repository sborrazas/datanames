jQuery(function ($) {

  /*
   * Check for Function.prototype.bind and define if not defined.
   */
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
      }

      var aArgs = Array.prototype.slice.call(arguments, 1)
        , fToBind = this
        , fNOP = function () {}
        , fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  var MIN_YEAR = 1960
    , MAX_YEAR = 2010
    , App = {
      /**
       *
       */
      initialize: function () {
        this.bindEvents();
      },
      /**
       *
       */
      bindEvents: function () {
        var $form = $("#name-form");

        $form.submit(function (event) {
          var name = $("#name").val()
            , year = $("#year").val()
            , processor;

          event.preventDefault();

          processor = new DataProcessor(name, year);
          processor.fetchData().done(function (data) {
            this.displayStatistics(data.statistics);
            this.processNameData(data.name, data.nameData);
            if (data.year) {
              $("#extra-year-data .specific-year").text(data.year);
              this.displayYearStatistics(data.yearData, "male");
              this.displayYearStatistics(data.yearData, "female");
            }
          }.bind(this)).fail(function (error) {
            alert(error.type);
          });
        }.bind(this));
      },
      /**
       *
       */
      displayStatistics: function (statistics) {
        var length = statistics.length
          , i = 0
          , $container = $("#extra-name-data ul")
          , $li, title, desc;

        $container.empty();

        for (; i < length; i += 1) {
          title = statistics[i].title;
          desc = statistics[i].description;
          $li = $("<li><span class=\"number-info\">" + title + "</span>" + desc + "</li>");
          $container.append($li);
        }
      },
      /**
       *
       */
      displayYearStatistics: function (yearData, gender) {
        var namesQuantity = []
          , genderIdentity = gender[0]
          , length = yearData[genderIdentity].length
          , i, name, quantity;

        $("#" + gender + "-year-chart").empty();

        for (i = 0; i < length; i += 1) {
          name = this.humanizeName(yearData[genderIdentity][i].name);
          quantity = yearData[genderIdentity][i].quantity;
          namesQuantity.push([name, quantity]);
        }

        $.jqplot(gender + "-year-chart", [namesQuantity], {
          title: {
            show: false
          },
          seriesColors: ["#363B48", "#3199D5", "#EA4640", "#F0C340", "#9D58B0", "#52BE7F"],
          seriesDefaults: {
            renderer: $.jqplot.DonutRenderer,
            shadow: false,
            markerOptions: {
              shadow: false,
              show: false
            }
          },
          grid: {
            drawGridlines: true,
            drawBorder: false,
            borderWidth: 0,
            shadow: false,
            background: "#FFF"
          },
          highlighter: {
            show: true,
            sizeAdjust: 2.5,
            useAxesFormatters: false,
            tooltipSeparator: " &mdash; ",
            tooltipFormatString: "<span class=\"tooltip-item\">%s</span>"
          },
          legend: {
            show: true
          }
        });
      },
      /**
       *
       */
      processNameData: function (name, nameData) {
        var serie = []
          , length = nameData.length
          , i = 0
          , series = {}
          , yearQuantityMap = {};

        for (; i < length; i += 1) {
          yearQuantityMap[nameData[i].year] = nameData[i].quantity;
        }

        for (i = MIN_YEAR; i <= MAX_YEAR; i += 1) {
          serie.push([i, yearQuantityMap[i] || 0]);
        }

        series[name] = serie;

        this.renderChart([name], series);
      },
      /**
       *
       */
      renderChart: function (names, series) {
        var quantitySeries = []
          , i = 0
          , namesSize = names.length
          , chart;

        for (i = 0; i < namesSize; i += 1) {
          quantitySeries.push(series[names[i]]);
        }

        $("#main").addClass("active");
        $("#main-chart").empty();

        $.jqplot("main-chart", quantitySeries, {
          title: {
            show: false
          },
          seriesColors: ["#363B48", "#3199D5", "#EA4640", "#F0C340", "#9D58B0"],
          seriesDefaults: {
            shadow: false,
            markerOptions: {
              shadow: false,
              show: false
            }
          },
          grid: {
            drawGridlines: true,
            drawBorder: false,
            borderWidth: 0,
            shadow: false,
            background: "#FFF",
            gridLineColor: "#E4E4E4"
          },
          axesDefaults: {
            showTickMarks: false,
            tickOptions: {
              showMark: false
            }
          },
          axes: {
            xaxis: {
              ticks: [[1958, ""], 1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, [2012, ""]],
              tickOptions: {
                showGridline: false,
                formatString: "%d"
              }
            },
            yaxis: {
              min: 0
            }
          },
          highlighter: {
            show: true,
            sizeAdjust: 2.5,
            useAxesFormatters: false,
            tooltipSeparator: " &mdash; ",
            tooltipFormatString: "<span class=\"tooltip-item\">%d</span>"
          },
          cursor: {
            show: false
          }
        });
      },
      /**
       *
       */
      humanizeName: function (name) {
        var processedName = name.replace(/_(.)?/, function (fullMatch, group0) {
          return typeof group0 === "string" ? " " + group0.toUpperCase() : "";
        });

        if (name.length > 0) {
          processedName = processedName.replace(/^(.)/, function (fullMatch, firstLetter) {
            return firstLetter.toUpperCase();
          });
        }

        return processedName;
      }
    };

  App.initialize();

});
