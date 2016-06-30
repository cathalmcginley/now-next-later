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

var path = require('path');

var bodyParser = require('body-parser')
  , express = require('express');

//var routes = require('./routes/index');
var users = require('./routes/user');
//var uitest = require('./routes/uitest');
//var graphdb = require('./graphdb');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';


// override the default 'X-Powered-By: Express' header
var poweredByHeader = function( req, res, next ){
  res.setHeader( 'X-Powered-By', 'NowNextLater v0.0.1, Express, Neo4J' );
  next()
}
app.use(poweredByHeader);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// app.engine('handlebars', exphbs({
//   defaultLayout: 'main',
//   partialsDir: ['views/partials/']
// }));
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'handlebars');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));

//app.use(logger('dev'));

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
//  extended: true
//}));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
app.use('/users', users);
//app.use('/uitest', uitest);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
