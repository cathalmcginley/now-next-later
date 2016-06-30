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

// c.f. http://stackoverflow.com/questions/25260818/rest-with-express-js-nested-router

/*
 * Routes for /users/<32132>/tasks/*
 * This includes GET for individual tasks and various task lists
 * as well as POST to create tasks and PUT to update
 */

var path = require('path');

var express = require('express');

var tasks = require('../models/tasks');

var router = express.Router({mergeParams: true});

router.route('/')
  .post(function(req, res) {  // POST : createTask
    var userId = req.params.user_id;
    tasks.createTask(userId, req.body, function(task, err) {
      var newPath = path.join(req.originalUrl, task.uuid);
      res.status(201).location(newPath).json(task);
    });
  });



  /*
   * various lists of a user's tasks
   * e.g /now/, /next/, /later/, /later-still/ ...
   */

    router.get('/', function(req, res) {
      console.log(req.params);
      res.send("list all tasks for user " + req.params.user_id);
    });

    router.route('/done/')
      .get(function(req, res) {
        res.send("list of done tasks");
      });

    router.route('/now/')
      .get(function(req, res) {
        res.send("list of NOW tasks");
      });


      router.get('/next/', function(req, res) {
        res.send('json list of all "next" tasks for ' + req.params.user_id);
      });

      router.get('/later/', function(req, res) {
        res.send('json list of all "later" tasks for ' + req.params.user_id);
      });



/*
 * this route comes here so the catch-all doesn't block /now/ etc.
 */

router.route('/:task_uuid/')
  .get(function(req, res) {  // GET : getTask by uuid
    var userId = req.params.user_id;
    var taskUuid = req.params.task_uuid;
    tasks.getTask(userId, taskUuid, function(task, err) {
      if (!err) {
        console.log(task);
        res.json(task);
      } else {
        res.status(err[0]).send(err[1]);
      }
    });
  })
  .put(function(req, res) {  // PUT : updateTask (incl mark as DONE)
    var userId = req.params.user_id;
    var taskUuid = req.params.task_uuid;
    var task = req.body
    tasks.updateTask(userId, taskUuid, task, function(task, err) {
      res.status(200).json(task);
    });

  });

router.route('/:task_uuid/dependencies/')
    .post(function(req, res) {  // POST : createTask
      var userId = req.params.user_id;
      var taskUuid = req.params.task_uuid;

      var taskPathRegex = /\/users\/(\d+)\/tasks\/([\w-]+)\/?/

      var rslt = taskPathRegex.exec(req.body.path);
      if (rslt) {
        var depUserId = rslt[1];
        var depTaskUuid = rslt[2];
        tasks.addDependency(userId, taskUuid, depUserId, depTaskUuid, function(dep, err) {
          var depUri = path.join(req.originalUrl, "/" + depTaskUuid);
          console.log(depUri);
          res.status(201).location(depUri).json(dep);
        });
      } else {
        res.sendStatus(400);
      }

    });



module.exports = router;
