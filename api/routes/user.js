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

var express = require('express');

var users = require('../models/users');

var tasksRouter = require('./user_tasks');
var projectsRouter = require('./user_projects');
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
router.use('/:user_id/projects/', projectsRouter);


module.exports = router;
