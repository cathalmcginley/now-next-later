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

//
// Model and DB access for Tasks
//

var uuid = require('uuid');
var _ = require('underscore');


var graphdb = require("./graphdb");
var qtemplate = require('../util/query_template')

var Task = function(uuid, title, summary, fullText, timeCreated) {
  //this.user = user;
  this.uuid = uuid;
  this.title = title;
  this.summary = summary;
  this.fullText = fullText;
  this.timeCreated = timeCreated;
  this.completed = false;
  this.timeCompleted = null;
}

var getTaskQuery = qtemplate("MATCH (u:User {userId: {{ q.userId }}})",
  "-[:OWNS]->",
  "(t:Task {uuid: '{{q.taskUuid}}'})",
  "RETURN t.title AS title, t.summary AS summary,",
  "t.fullText AS fullText, t.timeCreated AS timeCreated,",
  "t.completed AS completed, t.timeCompleted AS timeCompleted");

var getTask = function(userId, taskUuid, callback) {
  var session = graphdb.session();
  var q = {userId: userId, taskUuid, taskUuid};
  session.run(getTaskQuery(q)).then(function(rslt) {
    if (rslt.records.length === 1) {
      callback(recordToTask(taskUuid, rslt.records[0]), null);
    } else {
      callback(null, [404, "Task " + taskUuid + " not found"]);
    }
    session.close();
  });
}

var recordToTask = function(taskUuid, t) {

  var tCreated = new Date(t.get("timeCreated").toNumber());
  var tCompleted = null;
  var tcomp = t.get("timeCompleted");
  if (tcomp) {
    tCompleted = new Date(tcomp.toNumber());
  }
  var task = new Task(taskUuid, t.get("title"), t.get("summary"), t.get("fullText"), tCreated);
  task.completed = t.get("completed");
  task.timeCompleted = tCompleted;
  return task;
}

var getAllTasksQuery = qtemplate("MATCH (u:User {userId: {{q.userId}}})",
  "-[:OWNS]->(t:Task)",
  "WHERE t.completed = false", // TEMPORARY, until I deal with DONE tasks
  "RETURN t.uuid AS uuid,",
  "t.title AS title, t.summary AS summary,",
  "t.fullText AS fullText, t.timeCreated AS timeCreated,",
  "t.completed AS completed, t.timeCompleted AS timeCompleted");

var getFullGraphQuery = qtemplate("MATCH (u:User {userId: {{q.userId}}})",
  "-[:OWNS]->(t:Task)",
  "-[:DEPENDS_ON]->(d:Task)",
  "WHERE d.completed = FALSE", // stop stray null nodes
  // (caused by links t-owns->d where t is completed and not included in results)
  "RETURN t.uuid, d.uuid");

var getAllTasks = function(userId, callback) {
  var q = {userId: userId};
  var session = graphdb.session();
  var tasksPromise = session.run(getAllTasksQuery(q));
  var graphPromise = session.run(getFullGraphQuery(q));

  Promise.all([tasksPromise, graphPromise]).then(function(allResults) {
    var tRslt = allResults[0];
    var gRslt = allResults[1];
    var taskList = [];
    for (var i=0; i<tRslt.records.length; i++) {
      var tRec = tRslt.records[i];
      var taskUuid = tRec.get("uuid");
      taskList.push(recordToTask(taskUuid, tRec));
    }
    var graph = [];
    for (var i=0; i<gRslt.records.length; i++) {
      var gRec = gRslt.records[i];
      var task = gRec.get("t.uuid");
      var dep = gRec.get("d.uuid");
      graph.push([task, dep]);
    }
    var taskGraph = {tasks: taskList, graph: graph};
    callback(taskGraph, null);
  });


}


var createTaskCypher = qtemplate("MATCH (u:User {userId: {{ q.userId }}})",
  "MERGE (u)",
  "-[:OWNS]->",
  "(t:Task {uuid: '{{q.taskUuid}}',",
  "title: '{{q.title}}',",
  "summary: '{{q.summary}}',",
  "fullText: '{{q.fullText}}',",
  "timeCreated: {{q.created}},",
  "completed: false})");

/*
 * userId must refer to an existing user
 * taskData should have string fields "title", "summary", and "fullText"
 */
var createTask = function(userId, taskData, callback) {
  var newUuid = uuid.v4();
  var now = new Date();
  //var userIdX = 43;
  var q = {userId: userId, taskUuid: newUuid, title: taskData.title,
    summary:taskData.summary, fullText: taskData.fullText,
    created: now.getTime()};

  var task = new Task(q.taskUuid, q.title, q.summary, q.fullText, now);
  var session  = graphdb.session();
  session.run(createTaskCypher(q)).then(function(rslt) {
    // TODO check for errors
    callback(task, null);
    session.close();
  });

}


var createDependencyCypher = qtemplate("MATCH (u1:User {userId: {{q.u1}}})",
"-[:OWNS]-> (t1:Task {uuid:'{{q.t1}}'}),",
" (u2:User {userId: {{q.u2}}}) ",
"-[:OWNS]-> (t2:Task {uuid:'{{q.t2}}'})",
" MERGE (t1) -[:DEPENDS_ON {depUuid: '{{q.t2}}'}]-> (t2)");

var addDependency = function(userId, taskUuid, depUserId, depTaskUuid, callback) {
  // NOTE: prohibit self-links

  if (taskUuid === depTaskUuid) {
    callback(null, [400, "Cannot create self-dependent tasks"]);
    return;
  }

  var q = {u1: userId, t1: taskUuid, u2: depUserId, t2: depTaskUuid};

  var dep = {depUuid: depTaskUuid};

  var session = graphdb.session();
  session.run(createDependencyCypher(q)).then(function(rslt) {
    callback(dep, null);
    session.close();
  });
}

var deleteDependencyCypher = qtemplate("MATCH (u1:User {userId: {{q.u1}}})",
"-[:OWNS]-> (t1:Task {uuid:'{{q.t1}}'})",
"-[dep:DEPENDS_ON {depUuid: '{{q.depUuid}}'}]->",
"(t2:Task)",
"DELETE dep");

var deleteDependency = function(userId, taskUuid, depUuid, callback) {
  var q = {u1:userId, t1:taskUuid, depUuid: depUuid};
  var session = graphdb.session();
  session.run(deleteDependencyCypher(q)).then(function(rslt) {
    callback("totally...", null);
  });
}


var updateTaskCypher = qtemplate("MATCH (u:User {userId: {{ q.userId }}})",
  "-[:OWNS]->(t:Task {uuid: '{{q.taskUuid}}'})",
  "SET t.title = '{{q.title}}'",
  "SET t.summary = '{{q.summary}}'",
  "SET t.fullText = '{{q.fullText}}'",
  "SET t.timeCreated = {{q.timeCreated}}",
  "SET t.completed = {{q.completed}}",
  "SET t.timeCompleted = {{q.timeCompleted}}");

var updateTask = function(userId, taskUuid, task, callback) {
  var q = _.extend({userId:userId, taskUuid:taskUuid}, task);
  q['timeCreated'] = new Date(task.timeCreated).getTime();
  q['timeCompleted'] = new Date(task.timeCompleted).getTime();
  var session = graphdb.session();
  session.run(updateTaskCypher(q)).then(function(rslt) {
    callback(task, null);
    session.close();
  });

}

// var toJson = function(task) {
//   return {};
// }

module.exports = {
  Task: Task,
  getTask: getTask,
  getAllTasks: getAllTasks,
  createTask: createTask,
  updateTask: updateTask,
  addDependency: addDependency,
  deleteDependency: deleteDependency
}
