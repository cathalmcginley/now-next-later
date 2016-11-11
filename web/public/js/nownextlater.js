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

var ReallyExecuteOperations = true;

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
        var tasks = data.tasks;
        var deps = data.graph;
        for (var i=0; i<tasks.length; i++) {
          var taskData = tasks[i];
          var taskSum = new TaskSummary(taskData);
          taskHash[taskData.uuid] = taskSum;
          taskGraph.setNode(taskData.uuid);
        }
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
      allTaskData.now.tasks = uuidsToTasks(depGrid.now());
      allTaskData.next.tasks = uuidsToTasks(depGrid.next());
      allTaskData.later.tasks = uuidsToTasks(depGrid.later());
      allTaskData.laterStill.tasks = uuidsToTasks(depGrid.laterStill());

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
      //console.log(depGrid.now());
      //console.log(uuidsToTasks(depGrid.now()));
      allTaskData.now.tasks = uuidsToTasks(depGrid.now());
    }


    // var inEdgesAA1 = taskGraph.inEdges('aa1');
    // aa1.blocks = [];

    $scope.page = {
      modalVisible: false,
      taskDialogVisible: false,
      projectDialogVisible: false
    }

//    var debugModal = true; // DEV :: TODO remove this
//    debugModal = false;
//    $scope.page.modalVisible = debugModal;

    var newEmptyTask = function() {
      return {title: "",
        summary: "",
        fullText: ""
      };
    }
    
    var newEmptyProject = function() {
    	return {name: "", description: ""};
    }

    $scope.newTask = newEmptyTask();

    var showAddNewTaskDialog = function() {
      //console.log("Show 'Add New Task' Dialog");
      $scope.page.taskDialogVisible = true;
      $scope.page.modalVisible = true;
      $timeout(function() {      
	  angular.element('#new-task-dialog-form-init').focus();      
      }, 10);
    };
    var cancelAddNewTaskDialog = function() {
      //console.log("Cancel 'Add New Task' Dialog");
      $scope.page.modalVisible = false;
      $scope.page.taskDialogVisible = false;
    }
    
    var showAddNewProjectDialog = function() {
      console.log("Show 'Add New Project' Dialog");
      $scope.page.projectDialogVisible = true;
      $scope.page.modalVisible = true;
      $timeout(function() {      
	  angular.element('#new-project-dialog-form-init').focus();      
      }, 10);

    };
    var cancelAddNewProjectDialog = function() {
      console.log("Cancel 'Add New Project' Dialog");
      $scope.page.projectDialogVisible = false;
      $scope.page.modalVisible = false;
    }
      
    

    var addTaskToDisplay = function(taskData) {
      //console.log(taskData);


      var newUuid = taskData.uuid;
      var nts = new TaskSummary(taskData);
      //console.log(nts);
      taskHash[newUuid] = nts;
      //console.log(newUuid);
      //console.log(taskHash);
      taskGraph.setNode(newUuid);
      depGrid.insertNewTask(newUuid);
      updateTaskData();

      //$(function() {
      $timeout(function() {
        dndEnableAll([newUuid]);
        console.log([newUuid] + " done!")
      }, 150);

       //});

      //console.log("--------");
      //console.log(allTaskData.now);
      //console.log(allTaskData.next);
    }


    // create link  (b) -[:DEPENDS_ON]-> (a)
    var addRealDependency = function(b, a) {
    	if (ReallyExecuteOperations) {
      var bPath = userPath + b;
      var aDepPath = userPath + a + "/dependencies/";
      var pathData = JSON.stringify({path: bPath})
      var postPromise = $http.post(aDepPath, pathData);
      //var postPromise = $http.get(bPath); // HACK

      postPromise.success(function(na, status, headers, config) {
        //console.log("posted : " + status);
        // TODO rejigger whole graph
        //fadeIt(a);
        taskGraph.setEdge(a, b);
        //$timeout(function() {
          updateDepGridFromGraph();
        //}, 1000);
        //$timeout(function() { downloadTasks(); }, 100);
      });
    	} else {
    		console.log("FAKE addRealDependency(" + a + ", " + b + ")");
    	}
    }

    ////addTaskToDisplay({"uuid":"504c5a37-04f5-4e9d-b849-3bae011224be","title":"5w34","summary":"","fullText":"","timeCreated":"2016-07-01T10:07:51.279Z","completed":false,"timeCompleted":null});

    var addNewTask= function() {
      //console.log("Add New Task: " + $scope.newTask.title);
      // TODO upload data here!

      var taskData = JSON.stringify($scope.newTask);
      var postPromise = $http.post("/users/73489/tasks/", taskData);
      postPromise.success(function (taskData, status, headers, config) {
        //console.log("posted : " + status);
        addTaskToDisplay(taskData);
      });


      $scope.page.modalVisible = false;
      $scope.page.taskDialogVisibe = false;
      $scope.newTask = newEmptyTask();
      
    }
    
    var addNewProject = function() {
    	console.log("WORK IN PROGRESS addNewProject()");
    	
    	var projectData = JSON.stringify($scope.newProject);
    	console.log(projectData);
    	
    	var postPromise = $http.post("/users/73489/projects/", projectData);
    	postPromise.success(function(projectData, status, headers, config) {
    		addProjectToProjectList(projectData);
    	});
    	
    	$scope.page.modalVisible = false;
        $scope.page.projectDialogVisibe = false;
    	$scope.newProject = newEmptyProject();
    }

      var addProjectToProjectList = function(project) {
	  console.log("[WARNING] addProjectToProjectList not implemented");
      }

    var markAsDone = function(task) {
      //console.log("onMarkedDone // id :: " + task.id);
      var task = taskHash[task.id];
      //task.markDone();
      var taskJson = task.getData();
      var taskData = JSON.stringify(taskJson);
      var taskUri = userPath + task.id;
      //console.log(taskData);
      //console.log(taskUri);
      var putPromise = $http.put(taskUri, taskData);
      ////var putPromise = $http.get(taskUri);
      putPromise.success(function (data, status, headers, config) {
       console.log("PUT : " + status);
       //if (status === 200) {

         fadeIt(task.id);
       //}
      });

    }
    
    

    var filterDropTargets = function(taskId, dragIsStarting) {
    	var enableDisableDroppable = function(_id) {
    		var taskDiv = $("#" + _id);
    		$("#" + _id).droppable("option", "disabled", dragIsStarting);
    		x = "E";
    		if (dragIsStarting) {
    			x = "D";    	
    			taskDiv.addClass("exclude-droppable");
    		} else {
    			taskDiv.removeClass("exclude-droppable");
    		}
    		
    		console.log(x + " [[ " + $("#" + _id).droppable("option", "disabled") + " ]]");
    	}
    	
    	

    	var thisTaskBlocks = [];
    	var working = taskGraph.predecessors(taskId);
    	
    	console.log(working);    	
    	if (working.length > 0) {
    	  for (var i=0; i<working.length; i++) {    		
    		console.log("A " + working.length);
    		var current = working[i];
    		console.log("B " + current);    		
    		console.log("C " + working);
    		console.log("---\n\n");
    		thisTaskBlocks.push(current);
    		var more = taskGraph.predecessors(current);
    		_.each(more, function(m) { working.push(m); });
    	  }
    	} else {
    	  console.log("no predecessors for " + taskId);  
    	}	
    	
    	_.each(thisTaskBlocks, function(blockedId) {
    		enableDisableDroppable(blockedId);
    	});
    	
    	var thisTaskIsImmediatelyBlockedBy = taskGraph.outEdges(taskId);
    	_.each(thisTaskIsImmediatelyBlockedBy, function(edge) {
    		enableDisableDroppable(edge.w);
    	});
    } 

    //var filterDropTargetsDragStart = filterDropTargets(undefined, false);

    // HERE?
    var DragAndDrop = function() {

      var dragHandle = function(event) {
        var titleHtml = $(event.target).html();
        return $("<div class='drag-handle'>" + titleHtml + "</div>");
      }

      // TODO fix to prevent cyclic dependencies in UI

      var draggableOptions = { //containment: "#tasks-now-column",
       revert: 'invalid', // drag handle reverts unless there was a true drop
       delay: 150, // prevent title clicks becoming inadvertent drags
       handle: 'div.title',
       opacity: 0.8, // drag-handle opacity
	  zIndex: 10,
        helper: dragHandle,
        
       start: function(event, ui) {
         $( this ).addClass("being-dragged");
         var thisId = $(event.target).parent(".task").context.id;
         console.log(thisId);
         
         filterDropTargets(thisId, true);
       },
       stop: function(event, ui) {
           $( this ).removeClass("being-dragged");
           var thisId = $(event.target).parent(".task").context.id;
           console.log(thisId);
           filterDropTargets(thisId, false);
        }
     };


     var droppableOptions = {
       activeClass: "ui-state-default", // lights up possible targets
       hoverClass: "ui-state-hover",    // lights up when about to be droppped on
       drop: function( event, ui ) {
    	 var dragId = ui.draggable.attr('id');
         var dropId = $( this ).attr('id');
       
    	 var justDroppedOn = $(this);
    	  
         
    	 justDroppedOn.addClass( "just-dropped-on" );
    	 $timeout(function() {
    		 justDroppedOn.animate({ 'background-color': '#F5F5F5'}, 2500);
    	   justDroppedOn.removeClass("just-dropped-on"); //, 1000, "swing", function() {console.log("cb jdo");})
    	 }, 1000);
         
    	 $timeout(function() {
    	 var justDragged = $("#"+dragId)
    	 justDragged.addClass("just-dragged");
    	 $timeout(function() {
      	   
      	 justDragged.animate({ 'background-color': '#F5F5F5'}, 2500);
      	 justDragged.removeClass("just-dragged");
      	   //, 3000, "swing", function() {console.log("cb jd");})
      	 }, 1000);
    	 }, 150); // the dragged target may be re-drawn elsewhere, give AngularJS time to re-render

         
         console.log(dragId + " dropped onto " + dropId);
         //console.log("NOT REALLY ADDING DEPENDENCY");
         addRealDependency(dropId, dragId);
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

      var taskDiv = $('#' + taskUuid);
      taskDiv.animate({opacity: 0, height: 0, "margin-top": 0, "margin-bottom": 0}, 1250, "swing", function() {
    	  taskDiv.css({display: "none"});
          // remove DONE task
          delete taskHash[taskUuid];
          taskGraph.removeNode(taskUuid);
          updateDepGridFromGraph();
        });

    }


    $scope.taskData = allTaskData;
    $scope.showAddNewTaskDialog = showAddNewTaskDialog;
    $scope.cancelAddNewTaskDialog = cancelAddNewTaskDialog;
    $scope.addNewTask = addNewTask;
    
    $scope.showAddNewProjectDialog = showAddNewProjectDialog;
    $scope.cancelAddNewProjectDialog = cancelAddNewProjectDialog;
    $scope.addNewProject = addNewProject;
    
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


nowNextLaterModule.directive('nnlAutoFocus', function($timeout) {
    return {
        restrict: 'AC',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
		console.log("focussing...");
            }, 10);
        }
    };
});

nowNextLaterModule.component('taskSummary', {
  templateUrl: "templates/task-summary.html",

  controller: taskSummaryController,
  bindings: {
    task: '=',
    onTitleClick: '&',
    onMarkedDone: '&'
  }
  });
