var TaskApp = angular.module('TaskApp',['googlechart']);

	TaskApp.factory('_', function() {
		return window._; // assumes underscore has already been loaded on the page
  });

TaskApp.controller('TaskController', function ($scope, $http,_) {
  $scope.Title = "Github Tasks Analyzer";

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

    var graph1 = [];
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
            day : "Until Five Days",
            id : 2},
            {
            value: 0,
            day : "More Than Five",
            id : 3}
          ]

        });


        //Get the Issues closed in one day
        value.forEach(function(item) {
          if (item.status == "closed") {
            if (item.date.getTime() === item.closedTime.getTime()) {
              _.findWhere($scope.graph, {type: key}).days[0].value++;
            }
            else {
              if (item.closedTime.getTime() < (item.date.getTime() + 5) ) {
                _.findWhere($scope.graph, {type: key}).days[1].value++;
              }
              else {
                _.findWhere($scope.graph, {type: key}).days[2].value++;
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

    $scope.chartObject1 = angular.copy(chartSkeleton);
    $scope.chartObject1.data.rows = objChart1;


    $scope.objCharts = [];
    var i = 0;
    angular.forEach($scope.qType, function(value, key) {
      var otherSkel = angular.copy(chartSkeleton);
      $scope.objCharts.push(otherSkel);

      _.where($scope.graph, {type: key})[0].days.forEach(function(day) {
        $scope.objCharts[i].data.rows.push({
          "c":[ {
                "v": key
              },
              {
                "v": day.value,
                "f": day.day
              }
            ]
          });
        });

        i++;
      });
      $scope.showGraph = true;

  };

  $scope.downloadTasks = function(max,repository) {
    $scope.tasks = {
      count : max,
      task : []
    };
    for (count = 1; count <= max; count++) {

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
      var time = data.substring(opened + 61, opened + 71);
      // Verify the satus
      var auxStr = data.search("<div class=\"state state-open\">");
      var status = '';
      var closedTime
      if (auxStr != -1)
        status = "open";


      else {
        // If status are close, then should to get the closed date
        status = "closed";

        auxStr = data.search("closed this ");
        auxStr = data.substring(auxStr);
        auxStr = data.search("datetime=\"");
        closedTime = data.substring(auxStr +10, auxStr+20 );
      }

      // Get the task type
      var auxInt = data.search("<div class=\"labels css-truncate\">");
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
          closedTime : new Date(closedTime),
          type: type
        });


    }
  };


});
