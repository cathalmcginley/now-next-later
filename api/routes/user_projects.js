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
			res.json(projects);
		} else {
			res.status(err[0]).send(err[1]);
		}
	});
}).post(function(req, res) { 
	// POST : createProject
	var userId = req.params.user_id;
	projects.createProject(userId, req.body, function(project, err) {
		var newPath = path.join(req.originalUrl, (project.projectId + ''));
		res.status(201).location(newPath).json(project);
	});
});

router.route('/keytest').get(function(req, res) {
	var userId = req.params.user_id;
	projects.getCurrentKeyAndIncrement(userId, function(currKey) {
		res.status(200).json({key: currKey})	
	});
	
	
});

module.exports = router;