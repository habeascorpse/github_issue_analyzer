var TaskApp = angular.module('TaskApp',[]);

TaskApp.controller('TaskController', function ($scope, $http) {
  $scope.Title = "Github Tasks Analyzer";

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
          date : time,
          status : status,
          closedTime : closedTime,
          type: type
        });
    }
  };


});
