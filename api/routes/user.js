var express = require('express');

var users = require('../models/users');

var tasksRouter = require('./user_tasks');
var router = express.Router();



router.get('/:user_id/', function(req, res) {
  var userId = req.params.user_id;
  users.getUser(userId, function(u, err) {
    if (!err) {
      res.json(u);
    } else {
      res.status(err[0]).send(err[1]);
    }});
});

router.use('/:user_id/tasks/', tasksRouter);


module.exports = router;
