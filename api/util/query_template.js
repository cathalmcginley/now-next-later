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

// string interpolation for Cypher queries, using underscore

var _ = require('underscore');

var mustacheInterpolatePattern = /\{\{(.+?)\}\}/g
var templateSettings = {
  interpolate: mustacheInterpolatePattern,
  variable: 'q'
};

/*
 * Creates a template using mustache-style variables;
 * variables should have the q. prefix.
 * e.g. "WHERE name = {{ q.name }}".
 *
 * May be called with several strings, they will be joined
 * with newlines for readability.
 */
var makeQueryTemplate = function() {
  var argsArray = Array.prototype.slice.call(arguments);
  return _.template(argsArray.join("\n"), templateSettings)
}

// TODO the above function should have a filter to escape
// single and double quotes in order to defeat INJECTION attacks

module.exports = makeQueryTemplate;
