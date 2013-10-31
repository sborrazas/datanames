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
          var names = $("#name").val().split(',')
            , year = $("#year").val()
            , mainName = names.shift()
            , url;

          event.preventDefault();

          if (mainName !== "") {
            url = "/nombre/" + mainName + "/" + year;
            if (names.length > 0) {
              url += "?others=" + names.join(",");
            }
            document.location.href = url;
          }
          else {
            this._displayError({ type: "invalid_name" });
          }
        }.bind(this));
      },
      /**
       *
       */
      render: function () {
        var names = $("#name").val().split(",")
          , year = $("#year").val()
          , processor;

        this._clearFormErrors();

        processor = new DataProcessor(names, year);
        processor.fetchData().done(function (data) {
          this.displayStatistics(data.statistics);
          this.processNamesData(data.processedNames, data.year, data.namesData);
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
        var $container = $("#extra-name-data ul")
          , i, length, $li, title, desc;

        $container.empty();

        for (i = 0, length = statistics.length; i < length; i += 1) {
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
          , genderData = yearData[genderIdentity]
          , i, length, name, quantity;

        $("#" + gender + "-year-chart").empty();

        for (i = genderData.length - 1; i >= 0; i -= 1) {
          name = this.humanizeName(genderData[i].name);
          quantity = genderData[i].quantity;
          namesQuantity.push([name, quantity]);
        }

        $.jqplot(gender + "-year-chart", [namesQuantity], {
          title: {
            show: false
          },
          seriesColors: ["#363B48", "#00B233", "#3199D5", "#EA4640", "#F0C340", "#9D58B0", "#52BE7F", "#960CE8", "#E8660C", "#B21212"],
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
      processNamesData: function (names, year, namesData) {
        var serie = []
          , mainName = names[0]
          , series = {}
          , yearQuantityMap, namesLength, serieLength, i, j, serie, name;

        for (i = 0, namesLength = names.length; i < namesLength; i += 1) {
          name = names[i];
          serie = [];
          series[name] = serie;
          name = names[i];
          nameData = namesData[name];
          yearQuantityMap = {};
          // Map all data years to their quantity
          for (j = 0, length = nameData.length; j < length; j += 1) {
            yearQuantityMap[nameData[j].year] = nameData[j].quantity;
          }
          // Go through all years and create a pair (with 0 as default quantity)
          for (j = MIN_YEAR; j <= MAX_YEAR; j += 1) {
            serie.push([j, yearQuantityMap[j] || 0]);
          }
        }

        series["me"] = [[year, yearQuantityMap[year]]];
        names.push("me");

        this.renderChart(names, series);
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

        yaxisOptions = this._getYaxisOptions(quantitySeries);
        seriesOptions = this._getSeriesOptions(names, quantitySeries);

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
          series: seriesOptions,
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
              ticks: [[1958, ""], 1960, 1970, 1980, 1990, 2000, 2010, [2012, ""]],
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
          },
          legend: {
            show: true
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

        this._clearFormErrors();

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
      _clearFormErrors: function () {
        var $form = $("#name-form");
        $form.find(".form-field.error").removeClass("error");
        $form.find(".form-error").remove();
      },
      /**
       *
       */
      _getYaxisOptions: function (series) {
        var yaxisOptions = { min: 0 }
          , maxValue = 0
          , i, j, serie, seriesLength, serieLength;

        for (i = 0, seriesLength = series.length; i < seriesLength; i += 1) {
          serie = series[i];
          for (j = 0, serieLength = serie.length; j < serieLength; j += 1) {
            if (serie[j][1] > maxValue) {
              maxValue = serie[j][1];
            }
          }
        }

        if (maxValue <= 6) {
          yaxisOptions.max = 6;
        }

        return yaxisOptions;
      },
      /**
       *
       */
      _getSeriesOptions: function (names, series) {
        var seriesOptions = []
          , i, length;

        for (i = 0, length = series.length; i < (length - 1); i += 1) {
          seriesOptions.push({
            label: this.humanizeName(names[i]),
            markerOptions: {
              size: 6,
              lineWidth: 1
            },
          });
        }

        seriesOptions.push({
          markerOptions: {
            color: "#52BE7F",
            show: true,
            size: 9
          }
        });

        return seriesOptions;
      }
    };

  App.initialize();

  if ($("#name").val() !== "") {
    App.render();
  }

  $(".help-tooltip").tooltip();

});
