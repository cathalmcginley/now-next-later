var path = require('path');
var express = require('express');

var projects = require('../models/projects');

var router = express.Router({
	mergeParams : true
});

router.route('/').get(function(req, res) { 
	// GET : getAllProjects for this user
	var userId = req.params.user_id;
	projects.getAllProjects(userId, function(projects, err) {
		if (!err) {
			console.log(projects);
			res.json(projects);
		} else {
			res.status(err[0]).send(err[1]);
		}
	});
}).post(function(req, res) { 
	// POST : createProject
	var userId = req.params.user_id;
	projects.createProject(userId, req.body, function(project, err) {
		console.log("got project " + project);
		console.log(req.originalUrl);
		console.log(project.projectId);
		var newPath = path.join(req.originalUrl, (project.projectId + ''));
		console.log("got path " + newPath);
		res.status(201).location(newPath).json(project);
	});
});

module.exports = router;