var d3 = require("d3");
var Highcharts = require("highcharts");
var moment = require("moment");

var colData = [];
var tempSeries = [];
var categoryX = [];

BarChartHighChart.defaultSettings = {
  HorizontalAxis: "value",
  Legend: "category",
  Timestamp: "ts",
  Format: "YYYY/MM/DD",
  Title: "Bar Chart high charts",
};

BarChartHighChart.settings = EnebularIntelligence.SchemaProcessor(
  [
    {
      type: "text",
      name: "Title",
    },
    {
      type: "select",
      name: "Format",
      options: ["YYYY/MM/DD", "MM/YYYY"],
    },
  ],
  BarChartHighChart.defaultSettings
);

function createBarChartHighChart(that) {
  if (tempSeries != []) tempSeries = [];
  ConvertDataAPI(that);
  that.barChartHighChartC3 = Highcharts.chart("root", {
    chart: {
      type: "spline",
    },

    legend: {
      symbolWidth: 40,
    },

    title: {
      text: that.settings.Title,
    },

    subtitle: {
      text: "",
    },

    yAxis: {
      title: {
        text: "Value",
      },
      accessibility: {
        description: "Value",
      },
    },

    xAxis: {
      title: {
        text: "Date",
      },
      categories: categoryX,
    },

    tooltip: {
      valueSuffix: "%",
    },

    series: tempSeries,

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 550,
          },
          chartOptions: {
            chart: {
              spacingLeft: 3,
              spacingRight: 3,
            },
            legend: {
              itemWidth: 150,
            },
            xAxis: {
              categories: categoryX,
              title: "",
            },
            yAxis: {
              visible: false,
            },
          },
        },
      ],
    },
  });
}

function BarChartHighChart(settings, options) {
  var that = this;
  this.el = window.document.createElement("div");
  this.el.id = "chart";

  this.settings = settings;
  this.options = options;
  this.data = [];
  this.maxNumber = 0;
  this.minNumber = 0;

  this.width = options.width || 700;
  this.height = options.height || 500;

  this.margin = { top: 20, right: 80, bottom: 30, left: 50 };

  setTimeout(function () {
    createBarChartHighChart(that);
  }, 100);
}

BarChartHighChart.prototype.addData = function (data) {
  var that = this;
  function fireError(err) {
    if (that.errorCallback) {
      that.errorCallback({
        error: err,
      });
    }
  }

  if (data instanceof Array) {
    var value = this.settings.HorizontalAxis;
    var legend = this.settings.Legend;
    var ts = this.settings.Timestamp;
    var limit = this.settings.Limit;

    this.filteredData = data
      .filter((d) => {
        let hasLabel = d.hasOwnProperty("category");
        const dLabel = d["category"];
        if (typeof dLabel !== "string") {
          fireError("VerticalAxis is not a string");
          hasLabel = false;
        }
        return hasLabel;
      })
      .filter((d) => {
        let hasLabel = d.hasOwnProperty(value);
        const dLabel = d[value];
        if (typeof dLabel !== "string" && typeof dLabel !== "number") {
          fireError("VerticalAxis is not a string or number");
          hasLabel = false;
        }
        return hasLabel;
      })
      .filter((d) => {
        let hasTs = d.hasOwnProperty(ts);
        if (isNaN(d[ts])) {
          fireError("timestamp is not a number");
          hasTs = false;
        }
        return hasTs;
      })
      .sort((a, b) => b.ts - a.ts);
    if (this.filteredData.length === 0) {
      return;
    }
    this.data = d3
      .nest()
      .key(function (d) {
        return d[legend];
      })
      .entries(this.filteredData)
      .map(function (d, i) {
        d.values = d.values.filter(function (dd, ii) {
          if (!isNaN(limit)) return ii < limit;
          return ii;
        });
        return d;
      })
      .sort(function (a, b) {
        if (a.key < b.key) return -1;
        if (a.key > b.key) return 1;
        return 0;
      });
    this.convertData();
  } else {
    fireError("no data");
  }
};

BarChartHighChart.prototype.clearData = function () {
  this.data = {};
  colData = [];
  tempSeries = [];
  this.refresh();
};

BarChartHighChart.prototype.convertData = function () {
  colData = this.data;
  this.refresh();
};

function ConvertDataAPI(that) {
  tempSeries = [];
  categoryX = [];
  colData.forEach(function (val, index) {
    var dataVal = [];
    for (var i = 0; i < val.values.length; i++) {
      dataVal.push(colData[index]["values"][i]["value"]);
      if (index == 0) {
        categoryX.push(
          moment(colData[index]["values"][i]["ts"]).format(that.settings.Format)
        );
      }
    }
    tempSeries.push({
      data: dataVal,
      name: colData[index]["key"],
    });
  });
}

BarChartHighChart.prototype.resize = function (options) {
  this.width = options.width;
  this.height = options.height - 50;
};

var defaultData = [];
BarChartHighChart.prototype.refresh = function () {
  var that = this;

  ConvertDataAPI(that);

  if (this.axisX) this.axisX.remove();
  if (this.axisY) this.axisY.remove();
  if (this.yText) this.yText.remove();

  if (tempSeries.length > 0 && defaultData.length == 0) {
    tempSeries.forEach(function (val, i) {
      var temp_data = ["", ""];
      var temp_name = val.name;
      var temp_ts = [""];

      defaultData.push({
        data: temp_data,
        name: temp_name,
        ts: temp_ts,
      });
    });
  }
  if (tempSeries.length == 0 && defaultData.length > 0)
    tempSeries = defaultData;

  if (that.barChartHighChartC3) {
    that.barChartHighChartC3 = Highcharts.chart("root", {
      chart: {
        type: "spline",
      },

      legend: {
        symbolWidth: 40,
      },

      title: {
        text: that.settings.Title,
      },

      subtitle: {
        text: "",
      },

      yAxis: {
        title: {
          text: "Value",
        },
        accessibility: {
          description: "Value",
        },
      },

      xAxis: {
        title: {
          text: "Date",
        },
        accessibility: {
          description: "Time from December 2010 to September 2019",
        },
        categories: categoryX,
      },

      tooltip: {
        valueSuffix: "%",
      },

      series: tempSeries,

      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 550,
            },
            chartOptions: {
              chart: {
                spacingLeft: 3,
                spacingRight: 3,
              },
              legend: {
                itemWidth: 150,
              },
              xAxis: {
                categories: categoryX,
                title: "",
              },
              yAxis: {
                visible: false,
              },
            },
          },
        ],
      },
    });
  }
};

BarChartHighChart.prototype.onError = function (errorCallback) {
  this.errorCallback = errorCallback;
};

BarChartHighChart.prototype.getEl = function () {
  return this.el;
};

window.EnebularIntelligence.register("barChartHighChart", BarChartHighChart);

module.exports = BarChartHighChart;
