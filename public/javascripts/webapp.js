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
            , year = $("#year").val();

          event.preventDefault();

          document.location.href = "/nombre/" + name + "/" + year;
        }.bind(this));
      },
      /**
       *
       */
      render: function () {
        var name = $("#name").val()
          , year = $("#year").val()
          , processor;

        this._clearFormErrors($("#name-form"));

        processor = new DataProcessor(name, year);
        processor.fetchData().done(function (data) {
          this.displayStatistics(data.statistics);
          this.processNameData(data.name, data.year, data.nameData);
          if (data.year) {
            $("#extra-year-data .specific-year").text(data.year);
            this.displayYearStatistics(data.yearData, "male");
            this.displayYearStatistics(data.yearData, "female");
          }
        }.bind(this)).fail(function (error) {
          this._displayError(error);
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
      processNameData: function (name, year, nameData) {
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
        series["me"] = [[year, yearQuantityMap[year]]];

        this.renderChart([name, "me"], series);
      },
      /**
       *
       */
      renderChart: function (names, series) {
        var quantitySeries = []
          , i = 0
          , namesSize = names.length
          , chart, yaxisOptions;

        for (i = 0; i < namesSize; i += 1) {
          quantitySeries.push(series[names[i]]);
        }

        yaxisOptions = this._getYaxisOptions(quantitySeries[0]);

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
              style: "circle",
              show: false
            }
          },
          series: [
            {
              markerOptions: {
                size: 6,
                lineWidth: 1,
                color: "#52BE7F"
              }
            },
            {
              markerOptions: {
                color: "#52BE7F",
                show: true,
                size: 9
              }
            }
          ],
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
            yaxis: yaxisOptions
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
      },
      /**
       *
       */
      _displayError: function (error) {
        var $nameField = $(".form-field:has(#name)")
          , $yearField = $(".form-field:has(#year)");

        switch (error.type) {
          case "invalid_name":
            this._displayInputError($nameField, "El nombre es inv&aacute;lido");
            break;
          case "name_not_found":
            this._displayInputError($nameField, "No se encontr&oacute; el nombre ingresado");
            break;
          case "year_not_found":
            this._displayInputError($yearField, "No se encontr&oacute; el a&ntilde;o ingresado");
            break;

        }
      },
      /**
       *
       */
      _displayInputError: function ($field, errorMessage) {
        var errorHTML = [
          "<div class=\"form-error\">",
            "<span class=\"tooltip-arrow\"></span>",
            "<p>" + errorMessage + "</p>",
          "</div>"
        ].join("");

        $field.find(".form-input").append(errorHTML);
        $field.addClass("error");
      },
      /**
       *
       */
      _clearFormErrors: function ($form) {
        $form.find(".form-field.error").removeClass("error");
        $form.find(".form-error").remove();
      },
      /**
       *
       */
      _getYaxisOptions: function (serie) {
        var yaxisOptions = { min: 0 }
          , maxValue = 0
          , i, length;

        if (serie.length === 0) {
          yaxisOptions.ticksNumber = 10;
        }
        else {
          for (i = 0, length = serie.length; i < length; i += 1) {
            if (serie[i][1] > maxValue) {
              maxValue = serie[i][1];
            }
          }
          console.log(maxValue);
          if (maxValue <= 6) {
            yaxisOptions.max = 6;
          }
        }

        return yaxisOptions;
      }
    };

  App.initialize();

  if ($("#name").val() !== "") {
    App.render();
  }

});
