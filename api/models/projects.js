var uuid = require('uuid');
var _ = require('underscore');


var graphdb = require("./graphdb");
var qtemplate = require('../util/query_template')

var users = require('./users');

var Project = function(projectId, name, description, timeCreated) {
  this.projectId = projectId;
  this.name = name;
  this.description = description;
  
  this.completed = false;
  this.timeCompleted = null;
}


var createProjectCypher = qtemplate("MATCH (u:User {userId: {{ q.userId }}})",
  "MERGE (u)",
  "-[:PLANS]->",
  "(p:Project {projectId: {{q.projectId}},",
  "name: '{{q.name}}',",
  "description: '{{q.description}}',",
  "timeCreated: {{q.created}},",
  "completed: false})");

var nextProjectId = function(userId) {
	console.log("|| =========================================================");
	console.log("|| = TODO implement LCG Keys for users =====================");
	console.log("|| =========================================================");
	return 1;
}

/*
 * userId must refer to an existing user
 * projectData should have string fields "name", and "description"
 */
var createProject = function(userId, projectData, callback) {
  var newProjectId = nextProjectId(userId);
  var now = new Date();
  var q = {userId: userId, projectId: newProjectId, name: projectData.name, 
		  description: projectData.description, created: now.getTime()};
  
  console.log(createProjectCypher(q));

  var project = new Project(q.projectId, q.name, q.description, now);
  var session  = graphdb.session();
  session.run(createProjectCypher(q)).then(function(rslt) {
    console.log(rslt);
    // TODO check for errors
    console.log("Project> " + project);
    console.log("Project> " + project.name);
    callback(project, null);
    console.log("--done");
    session.close();
  });

}

module.exports = {
		  Project: Project,
//		  getTask: getTask,
//		  getAllTasks: getAllTasks,
		  createProject: createProject
//		  updateTask: updateTask,
//		  addDependency: addDependency,
//		  deleteDependency: deleteDependency
		}
