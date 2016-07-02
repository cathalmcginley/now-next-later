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


    var taskGraph = new graphlib.Graph();
    var taskHash = {};
    var depGrid = new DependencyGrid(taskGraph);

    var userPath = "/users/73489/tasks/";

    var TaskSummary = function(taskData) {
      this.taskData = taskData;
      this.id = taskData.uuid;
      this.title = taskData.title;
      this.summary = taskData.summary;
      this.fullText = taskData.fullText;

      var dateString = taskData.timeCreated;
      taskData.timeCreated = new Date(dateString);
      this.created = taskData.timeCreated.toISOString();

      this.isCompact = true;
      this.isVisible = true;
      this.blockerOfCurrent = false;
      this.blockedByCurrent = false;
      this.blockedBy = [{title: "Alpha"}];
      this.blocks = [{title: "Beta"}];
      this.depth = 1;

      this.markDone = function() {
        this.taskData.completed = true;
        this.taskData.timeCompleted = new Date();
        markAsDone(this);
      }

      this.getData = function() {
        return this.taskData;
      }


    }


    var allTaskData = {
      done: [],
      now: {heading: "Now", tasks: []},
      next: {heading: "Next", tasks: []},
      later: {heading: "Later", tasks: []},
      laterStill: {heading: "Later Still", tasks: []}
    };


    var downloadTasks = function() {

      var getPromise = $http.get("/users/73489/tasks/")
      console.log(taskGraph.nodes());
      getPromise.success(function(data, status, headers, config) {
        console.log("got task data " + status);
        var tasks = data.tasks;
        var deps = data.graph;
        for (var i=0; i<tasks.length; i++) {
          var taskData = tasks[i];
          var taskSum = new TaskSummary(taskData);
          taskHash[taskData.uuid] = taskSum;
          taskGraph.setNode(taskData.uuid);
        }
        console.log("nodes " + taskGraph.nodes());
        console.log("sinks " + taskGraph.sinks());
        for (var j=0; j<deps.length; j++) {
          var dep = deps[j];
          taskGraph.setEdge(dep[0], dep[1]);
        }
        updateDepGridFromGraph();
      });
    }

    var updateDepGridFromGraph = function() {
      // re-create the dependency grid
      depGrid = new DependencyGrid(taskGraph);
      //console.log(taskGraph);
      console.log(JSON.stringify(graphlib.json.write(taskGraph)));
      console.log("-------------taskGraph");
      allTaskData.now.tasks = uuidsToTasks(depGrid.now());
      allTaskData.next.tasks = uuidsToTasks(depGrid.next());
      allTaskData.later.tasks = uuidsToTasks(depGrid.later());
      allTaskData.laterStill.tasks = uuidsToTasks(depGrid.laterStill());

      ////console.log(JSON.stringify(allTaskData));


      $timeout(function() {
        dndEnableAll(taskGraph.nodes());
      }, 150);

    }

    downloadTasks();

    var depLinks = function(uuids) {
      var deps = [];
      for (var i=0; i<uuids.length; i++) {
        var t = taskHash[uuids[i]];
        deps.push({uuid: t.uuid, title: t.title});
      }
      return deps;
    }

    var uuidsToTasks = function(uuids) {
      var tasks = [];
      for (var i=0; i<uuids.length; i++) {
        var task = taskHash[uuids[i]];
        task.blockedBy = depLinks(taskGraph.successors(uuids[i]));
        task.blocks = depLinks(taskGraph.predecessors(uuids[i]));
        tasks.push(task);
      }
      return tasks;
      // console.log("!! " + uuids);
      // return _.map(uuids, new function(u) {
      //   console.log(u + " >  " + taskHash[u]);
      //   return taskHash[u];
      // });
    }

    var updateTaskData = function() {
      console.log(depGrid.now());
      console.log(uuidsToTasks(depGrid.now()));
      allTaskData.now.tasks = uuidsToTasks(depGrid.now());
    }


    // var inEdgesAA1 = taskGraph.inEdges('aa1');
    // aa1.blocks = [];

    $scope.page = {
      modalVisible: false
    }

    var debugModal = true; // DEV :: TODO remove this
    debugModal = false;
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

    var addTaskToDisplay = function(taskData) {
      console.log(taskData);


      var newUuid = taskData.uuid;
      var nts = new TaskSummary(taskData);
      console.log(nts);
      taskHash[newUuid] = nts;
      console.log(newUuid);
      console.log(taskHash);
      taskGraph.setNode(newUuid);
      depGrid.insertNewTask(newUuid);
      updateTaskData();

      //$(function() {
      $timeout(function() {
        dndEnableAll([newUuid]);
        console.log([newUuid] + " done!")
      }, 150);

       //});

      console.log("--------");
      console.log(allTaskData.now);
      console.log(allTaskData.next);
    }


    // create link  (b) -[:DEPENDS_ON]-> (a)
    var addRealDependency = function(b, a) {
      var bPath = userPath + b;
      var aDepPath = userPath + a + "/dependencies/";
      var pathData = JSON.stringify({path: bPath})
      var postPromise = $http.post(aDepPath, pathData);
      //var postPromise = $http.get(bPath); // HACK

      postPromise.success(function(na, status, headers, config) {
        console.log("posted : " + status);
        // TODO rejigger whole graph
        //fadeIt(a);
        taskGraph.setEdge(a, b);
        //$timeout(function() {
          updateDepGridFromGraph();
        //}, 1000);
        //$timeout(function() { downloadTasks(); }, 100);
      });
    }

    ////addTaskToDisplay({"uuid":"504c5a37-04f5-4e9d-b849-3bae011224be","title":"5w34","summary":"","fullText":"","timeCreated":"2016-07-01T10:07:51.279Z","completed":false,"timeCompleted":null});

    var addNewTask= function() {
      console.log("Add New Task: " + $scope.newTask.title);
      // TODO upload data here!

      var taskData = JSON.stringify($scope.newTask);
      var postPromise = $http.post("/users/73489/tasks/", taskData);
      postPromise.success(function (taskData, status, headers, config) {
        console.log("posted : " + status);
        addTaskToDisplay(taskData);
      });


      $scope.page.modalVisible = false;
      $scope.newTask = newEmptyTask();
    }

    var markAsDone = function(task) {
      console.log("onMarkedDone // id :: " + task.id);
      var task = taskHash[task.id];
      //task.markDone();
      var taskJson = task.getData();
      var taskData = JSON.stringify(taskJson);
      var taskUri = userPath + task.id;
      console.log(taskData);
      console.log(taskUri);
      var putPromise = $http.put(taskUri, taskData);
      ////var putPromise = $http.get(taskUri);
      putPromise.success(function (data, status, headers, config) {
       console.log("PUT : " + status);
       //if (status === 200) {

         fadeIt(task.id);
       //}
      });

    }




    // HERE?

    var DragAndDrop = function() {

      var dragHandle = function(event) {
        var titleHtml = $(event.target).html();
        return $("<div class='drag-handle'>" + titleHtml + "</div>");
      }

      // TODO fix to prevent cyclic dependencies in UI

      var draggableOptions = { //containment: "#tasks-now-column",
       revert:'invalid',
       handle: 'div.title',
        opacity: 0.9,
        helper: dragHandle,
       start: function() {
         $( this ).addClass("being-dragged");
       },
       stop: function() {
           $( this ).removeClass("being-dragged");
        }
     };


     var droppableOptions = {
       activeClass: "ui-state-default", // lights up possible targets
       hoverClass: "ui-state-hover",    // lights up when about to be droppped on
       drop: function( event, ui ) {
         $( this )
           .addClass( "ui-state-highlight" );
           // TODO add red Blocker tag to bottom of div
           // TODO open up div if not already open
           //.find( "div.summary" )
           //   .html( "Dropped!" );
         var dragId = ui.draggable.attr('id');
         var dropId = $( this ).attr('id');
         console.log(dragId + " dropped onto " + dropId);
         addRealDependency(dropId, dragId);
         // TODO TODO NOW NOW - POST to 84902aef-849../dependencies/
       }}

        return {
          drag: draggableOptions,
          drop: droppableOptions
        }
      }

    var dndOptions = DragAndDrop();


    var dndEnable = function(taskUuid) {
        console.log(typeof taskUuid);
        var selector = '#' + taskUuid;
        console.log(">!!> " + selector);

        $(selector).draggable(dndOptions.drag);
        $(selector).droppable(dndOptions.drop);
        console.log("done?!!");

    }

    var dndEnableAll = function(uuids) {
      $(function() {
        for (var i=0; i<uuids.length; i++) {
          dndEnable(uuids[i]);
        }
      });
    }

    // HERE?
























    var fadeIt = function(taskUuid) {
      console.log("fadeIt " + taskUuid);
      console.log($('#' + taskUuid).fadeOut(800, function() {
        // remove DONE task
        delete taskHash[taskUuid];
        taskGraph.removeNode(taskUuid);
        updateDepGridFromGraph();
      }));

    }


    $scope.taskData = allTaskData;
    $scope.showAddNewTaskDialog = showAddNewTaskDialog;
    $scope.cancelAddNewTaskDialog = cancelAddNewTaskDialog;
    $scope.addNewTask = addNewTask;
    $scope.markAsDone = markAsDone;
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
    task.markDone();

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
    onTitleClick: '&',
    onMarkedDone: '&'
  }
  });
