/*
 * Model and DB access for Tasks
 */

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
  console.log(getTaskQuery(q));
  session.run(getTaskQuery(q)).then(function(rslt) {
    if (rslt.records.length === 1) {
      var t = rslt.records[0];
      console.log(t);
      var tc = t.get("timeCreated");
      console.log("  >>  " + tc + " :: " + (typeof tc));
      console.log(tc);
      console.log(tc.toNumber());
      var created = new Date(tc.toNumber());
      console.log("  >>> " + created);
      var task = new Task(taskUuid, t.get("title"), t.get("summary"), t.get("fullText"), created);
      callback(task, null);
    } else {
      callback(null, [404, "Task " + taskUuid + " not found"]);
    }
    session.close();
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
  var q = {userId: userId, taskUuid: newUuid, title: taskData.title,
    summary:taskData.summary, fullText: taskData.fullText,
    created: now.getTime()};
  console.log(createTaskCypher(q));

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
" MERGE (t1) -[:DEPENDS_ON]-> (t2)");

var addDependency = function(userId, taskUuid, depUserId, depTaskUuid, callback) {
  // NOTE: prohibit self-links

  if (taskUuid === depTaskUuid) {
    callback(null, [400, "Cannot create self-dependent tasks"]);
    return;
  }

  var q = {u1: userId, t1: taskUuid, u2: depUserId, t2: depTaskUuid};

  var dep = {depUuid: depTaskUuid};

  console.log(createDependencyCypher(q));

  var session = graphdb.session();
  session.run(createDependencyCypher(q)).then(function(rslt) {
    callback(dep, null);
    session.close();
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
  console.log(updateTaskCypher(q));
  var session = graphdb.session();
  session.run(updateTaskCypher(q)).then(function(rslt) {
    console.log(">> !");
    console.log(rslt);
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
  createTask: createTask,
  updateTask: updateTask,
  addDependency: addDependency
//  toJson: toJson
}
