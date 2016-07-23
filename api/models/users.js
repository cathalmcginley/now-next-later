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

var graphdb = require("./graphdb");
var qtemplate = require('../util/query_template')


var User = function(userId, userName) {
  this.userId = userId;
  this.userName = userName;
}

var getUserQuery = qtemplate("MATCH (u:User {userId: {{q.userId}}})",
  "RETURN u.name AS name");

var getUser = function(userId, callback) {
  var session = graphdb.session();
  session.run(getUserQuery({userId: userId})).then(function(rslt) {
    if (rslt.records.length === 1) {
     var user = new User(userId, rslt.records[0].get("name"));
     callback(user, null);
   } else {
     callback(null, [404, "User " + userId + " not found"]);
   }
   session.close();
  });
}

var toJson = function(user) {
  return JSON.stringify({name: user.name});
}


module.exports = {
  User: User,
  getUser: getUser,
  toJson: toJson
}
