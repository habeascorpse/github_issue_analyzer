var TaskApp = angular.module('TaskApp',['googlechart']);

	TaskApp.factory('_', function() {
		return window._; // assumes underscore has already been loaded on the page
  });

TaskApp.controller('TaskController', function ($scope, $http,_) {
  $scope.Title = "Github Tasks Analyzer";

  Date.prototype.addDays = function(days) {
      var dat = new Date(this.valueOf());
      dat.setDate(dat.getDate() + days);
      return dat;
  }


  var chartSkeleton = {
  "type": "PieChart",
  "displayed": false,
  "data": {
    "cols": [
      {
        "id": "type",
        "label": "Type",
        "type": "string",
        "p": {}
      },
      {
        "id": "quantity",
        "label": "Quantity",
        "type": "number",
        "p": {}
      }
    ],
    "rows" : [],
    "options": {
      "title": "Issues by types",
      "isStacked": "true",
      "fill": 20,
      "is3D" : true,
      "displayExactValues": true

    },
    "formatters": {}
    }
  };


  $scope.createGraph = function(tasks) {

    $scope.pType = _.groupBy(tasks.task, function(t) {
      return t.type;
    });

    $scope.qType = _.countBy(tasks.task, function(t) {
      return t.type;
    });

    $scope.graph = [];
    angular.forEach($scope.pType, function(value, key) {
        $scope.graph.push({
          type: key, days: [
            {
            value: 0,
            day : "One",
            id : 1},
            {
            value: 0,
            day : "in Five Days",
            id : 2},
            {
            value: 0,
            day : "in 30 Days",
            id : 3},
            {
            value: 0,
            day : "in 60 Days",
            id : 4},
            {
            value: 0,
            day : "in 180 Days",
            id : 5},
            {
            value: 0,
            day : "In 240 Days",
            id : 6},
            {
            value: 0,
            day : "In One Year",
            id : 7},
            {
            value: 0,
            day : "In two Years",
            id : 8},
            {
            value: 0,
            day : "More than two Years",
            id : 9}
          ]

        });


        //Get the Issues closed in one day
        value.forEach(function(item) {
          if (item.status == "closed") {
            if (item.date.getTime() === item.closedTime.getTime()) {
              _.findWhere($scope.graph, {type: key}).days[0].value++;
            }
            else {
              if (item.closedTime.getTime() <= (item.date.addDays(5)) ) {
                _.findWhere($scope.graph, {type: key}).days[1].value++;
              }
              else {
                if (item.closedTime.getTime() <= (item.date.addDays(30)) ) {
                  _.findWhere($scope.graph, {type: key}).days[2].value++;
                }
                else {
                  if (item.closedTime.getTime() <= (item.date.addDays(60)) ) {
                    _.findWhere($scope.graph, {type: key}).days[3].value++;
                  }
                  else {
                    if (item.closedTime.getTime() <= (item.date.addDays(180)) ) {
                      _.findWhere($scope.graph, {type: key}).days[4].value++;
                    }
                    else {
                      if (item.closedTime.getTime() <= (item.date.addDays(240)) ) {
                        _.findWhere($scope.graph, {type: key}).days[5].value++;
                      }
                      else {
                        if (item.closedTime.getTime() <= (item.date.addDays(365)) ) {
                          _.findWhere($scope.graph, {type: key}).days[6].value++;
                        }
                        else {
                          if (item.closedTime.getTime() <= (item.date.addDays(730)) ) {
                            _.findWhere($scope.graph, {type: key}).days[7].value++;
                          }
                          else {
                            _.findWhere($scope.graph, {type: key}).days[8].value++;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        })
    });

    var objChart1 = [];
    angular.forEach($scope.qType, function(value, key) {
      objChart1.push({
        "c":[ {
              "v": key
            },
            {
              "v": value,
              "f": value + " items"
            }
        ]
      });
    });

    $scope.objCharts = [];
    var chart1 = angular.copy(chartSkeleton);
    chart1.data.rows = objChart1;
    chart1.data.options.title = "Number of issues per type";
    $scope.objCharts.push(chart1);




    var i = 1;
    angular.forEach($scope.qType, function(value, key) {
      var otherSkel = angular.copy(chartSkeleton);
      otherSkel.data.options.title = key;
      $scope.objCharts.push(otherSkel);

      _.where($scope.graph, {type: key})[0].days.forEach(function(day) {
        $scope.objCharts[i].data.rows.push({
          "c":[ {
                "v": day.day
              },
              {
                "v": day.value,
                "f": day.value
              }
            ]
          });
        });

        i++;
      });
      $scope.showGraph = true;

  };

  $scope.downloadTasks = function(min,max,repository) {
    if ($scope.tasks == null) {
      $scope.tasks = {
        count : max,
        task : []
      };
    }

    for (count = min; count <= max; count++) {

      $http.get('https://github.com/' + repository + '/issues/'+count).success(function (data) {
        processData(data);
      });
    }
  };

  processData = function(data) {
    // Verify if the task is OK
    var opened = data.search(" opened this <span class=\"noun\">Issue</span> <time datetime=\"");
    if (opened != -1) {

      // Get the Date of Open
      var time = data.substring(opened + 61, opened + 81);
      // Verify the satus
      var auxStr = data.search("<div class=\"state state-open\">");
      var auxInt;
      var status = '';
      var closedTime;
      if (auxStr != -1)
        status = "open";


      else {
        // If status are close, then should to get the closed date
        status = "closed";

        auxInt = data.search("closed this ");
        if (auxInt != -1) {
          auxStr = data.substring(auxInt);
          auxInt = auxStr.search("datetime=\"");
          closedTime = auxStr.substring(auxInt +10, auxInt+30 );
        }
        else {
          status = "no status";
        }
      }

      // Get the task type
      auxInt = data.search("<div class=\"labels css-truncate\">");
      var type = "no type"
      if (auxInt != -1) {
        auxStr = data.substring(auxInt);
        auxInt = auxStr.search("=\"type: ");
        if (auxInt != -1) {
          auxStr = auxStr.substring(auxInt+8);
          auxInt = auxStr.search("\"");
          type = auxStr.substring(0,auxInt);
        }
      }

      // Add object to array
      $scope.tasks.task.push(
        {
          date : new Date(time),
          status : status,
          closedTime : closedTime == null ? null : new Date(closedTime),
          type: type
        });


    }
  };


});
