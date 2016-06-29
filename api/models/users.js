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
     console.log(qtemplate("Found user {{q.id}}: {{q.name}}")({id:userId, name: user.userName}));
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
