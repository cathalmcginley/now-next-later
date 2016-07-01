/*
 * Copyright (C) 2016 Cathal Mc Ginley
 *
 * This file is part of NowNextLater, a dependency-savvy ToDo web app.
 *
 * NowNextLater is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation; either version 3 of
 * the License, or (at your option) any later version.
 *
 * NowNextLater is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with NowNextLater; see the file COPYING.AFFERO. If
 * not, write to the Free Software Foundation, Inc., 51 Franklin
 * Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

var nowNextLaterModule = angular.module('NowNextLater', []);

/*
 * This is the main Now/Next/Later grid display, where next actions are in the
 * leftmost column and interdependencies are displayed.
 */
var dependencyListsController = nowNextLaterModule.controller('DependencyListsController',
  function($scope, $http, $timeout) {

    //var apiHost = "http://api.nownextlater.io";

    var TaskGraph = new graphlib.Graph();

    //console.log(uuid.v4());

    var createTask = function(uuid, title, summary, fulltext) {
      //var newUuid = uuid.v4();

      var dummyFulltext = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis nisl vulputate, congue leo eget, euismod augue. Nulla consectetur odio nisl, a lacinia felis fermentum quis. Praesent pellentesque est ut dui suscipit, sollicitudin bibendum risus imperdiet. Cras nec orci nec urna ullamcorper fringilla. Curabitur ut ligula tellus. Aliquam pellentesque scelerisque nisl eget placerat. Morbi sollicitudin quam nec iaculis congue. Cras scelerisque non justo sed facilisis. Fusce tincidunt dolor imperdiet ligula pretium maximus. Duis ac dolor sed orci porta bibendum.";
      return {
        id: uuid,
        title: title,
        summary: summary,
        fullText: dummyFulltext,
        created: new Date(),
        isCompact: true,
        isVisible: true,
        blockerOfCurrent: false,
        blockedByCurrent: false,
        blockedBy: [],
        blocks: [],
        depth: 1
      };
    }

    var aa1 = createTask("aa1", "A A One", "Some dummy text");
    TaskGraph.setNode(aa1);
    var aa2 = createTask("aa2", "A A Two", "Some dummy text");
    TaskGraph.setNode(aa2);
    var aa3 = createTask("aa3", "A A Three", "Some dummy text");
    TaskGraph.setNode(aa3);
    var aa4 = createTask("aa4", "A A Four", "Some dummy text");
    TaskGraph.setNode(aa4);
    var aa5 = createTask("aa5", "A A Five", "Some dummy text");
    TaskGraph.setNode(aa5);

    var bb1 = createTask("bb1", "B B One", "Some dummy text");
    TaskGraph.setNode(bb1);
    var bb2 = createTask("bb2", "B B Two", "Some dummy text");
    TaskGraph.setNode(bb2);
    var bb3 = createTask("bb3", "B B Three", "Some dummy text");
    TaskGraph.setNode(bb3);

    TaskGraph.setEdge(bb1, aa2);
    TaskGraph.setEdge(bb2, aa3);
    TaskGraph.setEdge(bb2, aa4);
    TaskGraph.setEdge(bb3, aa3);
    TaskGraph.setEdge(bb3, aa5);

    var cc1 = createTask("cc1", "C C One", "Some dummy text");
    TaskGraph.setNode(cc1);
    var cc2 = createTask("cc2", "C C Two", "Some dummy text");
    TaskGraph.setNode(cc2);
    var cc3 = createTask("cc3", "C C Three", "Some dummy text");
    TaskGraph.setNode(cc3);

    TaskGraph.setEdge(cc1, bb1);
    TaskGraph.setEdge(cc2, bb1);
    TaskGraph.setEdge(cc2, aa5);
    TaskGraph.setEdge(cc3, bb3);

    var TaskData = {
      done: [],
      now: {heading: "Now", tasks: [aa1, aa2, aa3, aa4, aa5]},
      next: {heading: "Next", tasks: [bb1, bb2, bb3]},
      later: {heading: "Later", tasks: [cc1, cc2, cc3]},
      laterStill: {heading: "Later Still", tasks: []}
    };

    var inEdgesAA1 = TaskGraph.inEdges('aa1');
    aa1.blocks = [];

    $scope.page = {
      modalVisible: false
    }

    var debugModal = true; // DEV :: TODO remove this
    $scope.page.modalVisible = debugModal;

    var newEmptyTask = function() {
      return {title: "",
        summary: "",
        fullText: ""
      };
    }

    $scope.newTask = newEmptyTask();

    var showAddNewTaskDialog = function() {
      console.log("Show 'Add New Task' Dialog");
      $scope.page.modalVisible = true;
    };
    var cancelAddNewTaskDialog = function() {
      console.log("Cancel 'Add New Task' Dialog");
      $scope.page.modalVisible = false;
    }

    var addNewTask= function() {
      console.log("Add New Task: " + $scope.newTask.title);
      // TODO upload data here!

      var taskData = JSON.stringify($scope.newTask);
      var postPromise = $http.post("/users/73489/tasks/", taskData);
      postPromise.success(function (data, status, headers, config) {
        console.log("posted : " + status);
      });


      $scope.page.modalVisible = false;
      $scope.newTask = newEmptyTask();
    }


    $scope.taskData = TaskData;
    $scope.showAddNewTaskDialog = showAddNewTaskDialog;
    $scope.cancelAddNewTaskDialog = cancelAddNewTaskDialog;
    $scope.addNewTask = addNewTask;
    console.log($scope);
});

var taskSummaryController = function($http) {
  this.title = "foo";
  this.summary = "wow, such much";
  var onTitleClick = function(task) {
    console.log("onTitleClick // id :: " + task.id);
    var taskDiv = $("#" + task.id);
    console.log(task.isCompact);
    task.isCompact = !task.isCompact;

  }

  this.onTitleClick = onTitleClick;
  this.onMarkedDone = function(task) {
      console.log("onMarkedDone // id :: " + task.id);

      var taskJson = {"uuid":"397e0895-4acc-404c-a664-c0ce392543f1","title":"wash dishes","summary":"listen to audiobook as I do","fullText":"This is a great idea","timeCreated":"2016-06-28T21:24:12.718Z","completed":false,"timeCompleted":null}
      taskJson['done']  = true;



      var taskData = JSON.stringify(taskJson);
      var taskUri = "/users/73489/tasks/" + "397e0895-4acc-404c-a664-c0ce392543f1"; //task.id;
      var postPromise = $http.put(taskUri, taskData);
      postPromise.success(function (data, status, headers, config) {
        console.log("posted : " + status);
      });
  }
};

//var onTitleClick = function() {
//    console.log("onTitleClick2");
//  }

// var newTaskDialogController = function() {
//   var cancelModalDialog = function() {
//     console.log("dbedfs");
//     $scope.page.modalVisible = false;
//   }
//   this.cancelModalDialog = cancelModalDialog;
// };

// nowNextLaterModule.component('taskDialog', {
//   templateUrl: "templates/new-task-dialog.html",
//     controller : ['$attrs', '$scope', function($attrs, $scope) {
//       this.cancelModalDialog = function() {
//         $scope.$parent.cancelModalDialog();
//       };
//     }],
//   bindings: {
//     cancelModalDialog: '&'
//   }
// });

/*template: '<div class="task" id="$ctrl.task.id" ng-class="{\'compact\': $ctrl.task.isCompact}">' +
'<div class="title" ng-click="$ctrl.onTitleClick($ctrl.task)">{{ $ctrl.task.title }}</div>' +
'<div class="summary">{{ $ctrl.task.summary }}</div>' +
'<div class="full-text">' +
  '<p>{{ $ctrl.task.fullText }}</p>' +
'</div>' +
'</div>',*/

nowNextLaterModule.component('taskSummary', {
  templateUrl: "templates/task-summary.html",

  controller: taskSummaryController,
  bindings: {
    task: '=',
    onTitleClick: '&'
  }
  });
