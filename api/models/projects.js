var uuid = require('uuid');
var _ = require('underscore');

var graphdb = require("./graphdb");
var qtemplate = require('../util/query_template')

var users = require('./users');
var LcgKey = require('../util/linear-congruential-generator-key');

var Project = function(projectId, name, description, timeCreated) {
	this.projectId = projectId;
	this.name = name;
	this.description = description;

	this.completed = false;
	this.timeCompleted = null;
}

var createProjectCypher = qtemplate("MATCH (u:User {userId: {{ q.userId }}})",
		"MERGE (u)", "-[:PLANS]->", "(p:Project {projectId: {{q.projectId}},",
		"name: '{{q.name}}',", "description: '{{q.description}}',",
		"timeCreated: {{q.created}},", "completed: false})");

var getCurrentKeyCypher = qtemplate("MATCH (u:User {userId: {{q.userId}}})",
		"-[:PROJECT_KEY]->", 
		"(k:LcgKey)",
		"RETURN",
		"k.initialSeed,",
		"k.multiplier,",
		"k.increment,",
		"k.modulus,",
		"k.initialOffset,",
		"k.currentSeed,",
		"k.fullLoopCount"
);

var recordToLcgKey = function(r) {
	return new LcgKey(r.get('k.initialSeed').toInt(),
			r.get('k.multiplier').toInt(),
			r.get('k.increment').toInt(), 
			r.get('k.modulus').toInt(),
			r.get('k.initialOffset').toInt(),
			r.get('k.currentSeed').toInt(),
			r.get('k.fullLoopCount').toInt());
	
}

var getCurrentKeyAndIncrement = function(userId) {
	var session = graphdb.session();
	var query = getCurrentKeyCypher({
		userId : userId
	});
	var currentKeyValue = -1;
	return session.run(query).then(function(rslt) {
		var key = recordToLcgKey(rslt.records[0]);
		currentKeyValue = key.current();
		var next = key.next();
		
		// write updated values
		var q2 = {userId: userId, currentSeed: key.lcg.value(), fullLoopCount: key.fullLoopCount};
		var cypher2 = qtemplate("MATCH (u:User {userId: {{q.userId}}})",
				"-[:PROJECT_KEY]->",
				"(k:LcgKey)",
				"SET k.currentSeed = {{q.currentSeed}}",
				"SET k.fullLoopCount = {{q.fullLoopCount}}");
		var query2 = cypher2(q2);
		return session.run(query2);
		
	}).then(function(rslt2) {
		session.close();
		return currentKeyValue;	
	});
}

/*
 * userId must refer to an existing user projectData should have string fields
 * "name", and "description"
 */
var createProject = function(userId, projectData, callback) {
	//var newProjectId = nextProjectId(userId);
	
	var keyValPromise = getCurrentKeyAndIncrement(userId);
	
	// =================
	//    TODO use getCurrentKeyAndIncrement here
	//         figure out how to use Promises cleanly!!!!we
	// =================
	
	
	var session = graphdb.session();
	var project = undefined;
	keyValPromise.then(function(newProjectId) {
		var now = new Date();
		var q = {
			userId : userId,
			projectId : newProjectId,
			name : projectData.name,
			description : projectData.description,
			created : now.getTime()
		};
		project = new Project(q.projectId, q.name, q.description, now);
		return session.run(createProjectCypher(q));
	}).then(function(rslt) {
		// TODO check for errors
		callback(project, null);
		session.close();
	});

}

module.exports = {
	Project : Project,
	getCurrentKeyAndIncrement : getCurrentKeyAndIncrement,
	// getTask: getTask,
	// getAllTasks: getAllTasks,
	createProject : createProject
// updateTask: updateTask,
// addDependency: addDependency,
// deleteDependency: deleteDependency
}
