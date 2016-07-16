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

var nextProjectId = function(userId) {
	console.log("|| =========================================================");
	console.log("|| = TODO implement LCG Keys for users =====================");
	console.log("|| =========================================================");
	return 1;
}

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

//var getCurrentKey = function(userId, callback) {
//	var q = {
//		userId : userId
//	};
//	console.log(getCurrentKeyCypher(q));
//	var session = graphdb.session();
//
//	session.run(getCurrentKeyCypher(q)).then(function(rslt) {
//		console.log("!!" + rslt);
//		var currentKey = rslt.records[0].get('k.currentSeed').toInt();
//		console.log("> currentKey: " + currentKey);
//		console.log(rslt.records[0]);
//		// console.log(">> " + rslt.records[0].get('k').toInt());
//		session.close();
//		callback(currentKey);
//	});
//
//}

var recordToLcgKey = function(r) {
	console.log(r);
	return new LcgKey(r.get('k.initialSeed').toInt(),
			r.get('k.multiplier').toInt(),
			r.get('k.increment').toInt(), 
			r.get('k.modulus').toInt(),
			r.get('k.initialOffset').toInt(),
			r.get('k.currentSeed').toInt(),
			r.get('k.fullLoopCount').toInt());
	
}

var getCurrentKeyAndIncrement = function(userId, callback) {
	var session = graphdb.session();
	var query = getCurrentKeyCypher({
		userId : userId
	});
	console.log(query);
	session.run(query).then(function(rslt) {
		console.log("rslt " + rslt);
		var key = recordToLcgKey(rslt.records[0]);
		var currentKeyValue = key.current();
		var next = key.next();
		
		// TODO write updated values
		console.log("NEXT VALUE IS   " + next);
		var q2 = {userId: userId, currentSeed: key.lcg.value(), fullLoopCount: key.fullLoopCount};
		var cypher2 = qtemplate("MATCH (u:User {userId: {{q.userId}}})",
				"-[:PROJECT_KEY]->",
				"(k:LcgKey)",
				"SET k.currentSeed = {{q.currentSeed}}",
				"SET k.fullLoopCount = {{q.fullLoopCount}}");
		var query2 = cypher2(q2);
		
		
		console.log("calling back with currentKeyValue " + currentKeyValue);
		
		callback(currentKeyValue);
		////session.close();
		console.log("-- running query --\n\n" + query2);
		return session.run(query2);
		
	}).then(function(rslt2) {
		console.log("rslt2 " + rslt2)
		session.close();
	});
	// console.log("> currentKey: " + currentKey);
	// return currentKey;
}

/*
 * userId must refer to an existing user projectData should have string fields
 * "name", and "description"
 */
var createProject = function(userId, projectData, callback) {
	var newProjectId = nextProjectId(userId);
	
	// =================
	//    TODO use getCurrentKeyAndIncrement here
	//         figure out how to use Promises cleanly!!!!
	// =================
	
	
	var now = new Date();
	var q = {
		userId : userId,
		projectId : newProjectId,
		name : projectData.name,
		description : projectData.description,
		created : now.getTime()
	};

	console.log(createProjectCypher(q));

	var project = new Project(q.projectId, q.name, q.description, now);
	var session = graphdb.session();
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
	Project : Project,
	getCurrentKeyAndIncrement : getCurrentKeyAndIncrement,
	// getTask: getTask,
	// getAllTasks: getAllTasks,
	createProject : createProject
// updateTask: updateTask,
// addDependency: addDependency,
// deleteDependency: deleteDependency
}
