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
