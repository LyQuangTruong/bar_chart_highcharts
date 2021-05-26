var d3 = require("d3");
var Highcharts = require("highcharts");
var moment = require("moment");

var colData = [];
var tempSeries = [];
var categoryX = [];

ScatterChart.defaultSettings = {
  VerticalAxis: "catagory",
  MaxV: "100",
  MinV: "0",
  HorizontalAxis: "value",
  MaxH: "100",
  MinH: "0",
  Legend: "category",
  Timestamp: "ts",
  Format: "YYYY/MM/DD",
  Title: "ABC123456",
  Tooltip: [
    {
      tag: "pressure",
    },
    {
      tag: "DeviceName",
    },
  ],
};

ScatterChart.settings = EnebularIntelligence.SchemaProcessor(
  [
    {
      type: "key",
      name: "VerticalAxis",
    },
    {
      type: "text",
      name: "MaxV",
    },
    {
      type: "text",
      name: "MinV",
    },
    {
      type: "key",
      name: "HorizontalAxis",
    },
    {
      type: "text",
      name: "MaxH",
    },
    {
      type: "text",
      name: "MinH",
    },
    {
      type: "key",
      name: "Legend",
    },
    {
      type: "text",
      name: "Timestamp",
    },
    {
      type: "select",
      name: "Limit",
      options: ["10", "20", "30", "all"],
    },
    {
      type: "select",
      name: "Format",
      options: ["YYYY/MM/DD","MM/YYYY"],
    },
    {
      type: "text",
      name: "Title",
    },
    {
      type: "list",
      name: "Tooltip",
      children: [
        {
          type: "text",
          name: "tag",
        },
      ],
    },
  ],
  ScatterChart.defaultSettings
);

function createScatterChart(that) {
  if (tempSeries != []) tempSeries = [];
  ConvertDataAPI(that);
  that.scatterChartC3 = Highcharts.chart('root', {
    chart: {
        type: 'spline'
    },

    legend: {
        symbolWidth: 40
    },

    title: {
        text: that.settings.Title
    },

    subtitle: {
        text: ''
    },

    yAxis: {
        title: {
            text: 'Percentage usage'
        },
        accessibility: {
            description: 'Percentage usage'
        }
    },

    xAxis: {
        title: {
            text: 'Time'
        },
        accessibility: {
            description: 'Time from December 2010 to September 2019'
        },
        categories: categoryX
    },

    tooltip: {
        valueSuffix: '%'
    },

    plotOptions: {
        series: {
            point: {
                events: {
                    click: function () {
                        // window.location.href = this.series.options.website;
                    }
                }
            },
            cursor: 'pointer'
        }
    },

    series: tempSeries,

    responsive: {
        rules: [{
            condition: {
                maxWidth: 550
            },
            chartOptions: {
                chart: {
                    spacingLeft: 3,
                    spacingRight: 3
                },
                legend: {
                    itemWidth: 150
                },
                xAxis: {
                    categories: categoryX,
                    title: ''
                },
                yAxis: {
                    visible: false
                }
            }
        }]
    }
});
}

function ScatterChart(settings, options) {
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

  this.z = [
    "#70C1B3",
    "#247BA0",
    "#FFE066",
    "#F25F5C",
    "#50514F",
    "#F45B69",
    "#211103",
    "#5C8001",
    "#23395B",
    "#470063",
  ];

  setTimeout(function () {
    createScatterChart(that);
  }, 100);
}

ScatterChart.prototype.addData = function (data) {
  var that = this;
  //console.log(data);
  function fireError(err) {
    if (that.errorCallback) {
      that.errorCallback({
        error: err,
      });
    }
  }

  if (data instanceof Array) {
    var category = this.settings.VerticalAxis;
    //console.log("VerticalAxis", category);
    var value = this.settings.HorizontalAxis;
    var legend = this.settings.Legend;
    /** console.log("legend", legend); */
    var ts = this.settings.Timestamp;
    var limit = this.settings.Limit;
    //console.log("limit", limit);

    this.filteredData = data
      .filter((d) => {
        // console.log('d.hasOwnProperty(category);', d.hasOwnProperty("category"))
        let hasLabel = d.hasOwnProperty("category");
        /** console.log("category", "category"); */
        const dLabel = d["category"];
        /** console.log("d[\'category\']", d["category"]);*/
        if (typeof dLabel !== "string") {
          fireError("VerticalAxis is not a string");
          hasLabel = false;
        }
        /** console.log("hasLabel category", hasLabel); */
        return hasLabel;
      })
      .filter((d) => {
        let hasLabel = d.hasOwnProperty(value);
        const dLabel = d[value];
        /** console.log("d[\'value\']", d["value"]); */
        if (typeof dLabel !== "string" && typeof dLabel !== "number") {
          fireError("VerticalAxis is not a string or number");
          hasLabel = false;
        }
        /** console.log("hasLabel value", hasLabel); */
        return hasLabel;
      })
      .filter((d) => {
        let hasTs = d.hasOwnProperty(ts);
        if (isNaN(d[ts])) {
          fireError("timestamp is not a number");
          hasTs = false;
        }
        /** console.log("hasTs ts", hasTs); */
        return hasTs;
      })
      .sort((a, b) => b.ts - a.ts);
    /** console.log("this.filteredData", this.filteredData); */
    if (this.filteredData.length === 0) {
      return;
    }
    this.data = d3
      .nest()
      .key(function (d) {
        // console.log("d[legend]", d[legend]);
        return d[legend];
      })
      .entries(this.filteredData)
      .map(function (d, i) {
        //console.log("d", d);
        d.values = d.values.filter(function (dd, ii) {
          //console.log("dd", dd);
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
    //console.log('this.data', this.data)
    this.convertData();
  } else {
    fireError("no data");
  }
};

ScatterChart.prototype.clearData = function () {
  this.data = {};
  colData = [];
  tempSeries = [];
  this.refresh();
};

ScatterChart.prototype.convertData = function () {
  colData = this.data;
  this.refresh();
};

var tooltipCheckExist = [];
var vertical = "";
var horizontal = "";
var timestamp = "";
var time = []

function ConvertDataAPI(that) {
  tempSeries = [];
  categoryX = [];
  console.log("colData", colData);
  colData.forEach(function (val, index) {
    var dataVal = [];
    for (var i = 0; i < val.values.length; i++) {
      dataVal.push(colData[index]["values"][i]['value']);
      if (index == 0) {
        categoryX.push(moment(colData[index]["values"][i]['ts']).format(that.settings.Format))
      }
    }
    tempSeries.push({
      data: dataVal,
      name: colData[index]["key"]
    });
  });
}

ScatterChart.prototype.resize = function (options) {
  this.width = options.width;
  this.height = options.height - 50;
};

var defaultData = [];
ScatterChart.prototype.refresh = function () {
  var that = this;
  tooltipCheckExist = [];
  /** console.log("colData", colData); */
  colData.forEach(function (val) {
    for (var i = 0; i < val.values.length; i++) {
      that.settings.Tooltip.forEach(function (tooltip) {
        var toolTipVal = tooltip.value;
        if (toolTipVal == null) toolTipVal = tooltip.tag;
        if (val.values[i].hasOwnProperty(toolTipVal)) {
          if (!tooltipCheckExist.includes(toolTipVal))
            tooltipCheckExist.push(toolTipVal);
        }
      });
    }
  });
  vertical = that.settings.VerticalAxis;
  horizontal = that.settings.HorizontalAxis;
  timestamp = that.settings.Timestamp;
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

  if (that.scatterChartC3) {
    console.log("that.scatterChartC3", that.scatterChartC3);
    that.scatterChartC3 = Highcharts.chart('root', {
      chart: {
          type: 'spline'
      },

      legend: {
          symbolWidth: 40
      },

      title: {
          text: that.settings.Title
      },

      subtitle: {
          text: ''
      },

      yAxis: {
          title: {
              text: 'Percentage usage'
          },
          accessibility: {
              description: 'Percentage usage'
          }
      },

      xAxis: {
          title: {
              text: 'Time'
          },
          accessibility: {
              description: 'Time from December 2010 to September 2019'
          },
          categories: categoryX
      },

      tooltip: {
          valueSuffix: '%'
      },

      plotOptions: {
          series: {
              point: {
                  events: {
                      click: function () {
                          // window.location.href = this.series.options.website;
                      }
                  }
              },
              cursor: 'pointer'
          }
      },

      series: tempSeries,

      responsive: {
          rules: [{
              condition: {
                  maxWidth: 550
              },
              chartOptions: {
                  chart: {
                      spacingLeft: 3,
                      spacingRight: 3
                  },
                  legend: {
                      itemWidth: 150
                  },
                  xAxis: {
                      categories: categoryX,
                      title: ''
                  },
                  yAxis: {
                      visible: false
                  }
              }
          }]
      }
  });
  }
};

ScatterChart.prototype.onError = function (errorCallback) {
  this.errorCallback = errorCallback;
};

ScatterChart.prototype.getEl = function () {
  return this.el;
};

window.EnebularIntelligence.register("scatterchart", ScatterChart);

module.exports = ScatterChart;
