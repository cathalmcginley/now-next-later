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

var graphlib = require('graphlib');
var SetDS = require('set-ds');
var _ = require('underscore');

var DependencyGrid = function(graph) {

    this.graph = graph;
    this.levels = [];

    
    //private
    this.findChildNodes = function(nodes) {
	var childNodes = new SetDS();
	var findChildren = function(memo, node, idx, lst) {      
	    var edges = graph.inEdges(node);
	    _.each(edges, function(e,k,l) { memo.add(e.v); });
	    return memo;
	}
	_.reduce(nodes, findChildren, childNodes);
	return childNodes.values();
    }


    // private
    this.cleanPrevious = function(num, tasks) {
	while (num > 0) {
	    this.levels[num] = _.difference(this.levels[num], tasks)
	    num -= 1;
	}
    }

    this.addLevel = function(num, tasks) {
	if (num >= this.levels.length) {
	    this.size += 1;
	    this.levels.push(tasks);
	    this.cleanPrevious(num-1, tasks);
	}
    }

    this.getLevel = function(num) {
	if (num < this.levels.length) {
	    return this.levels[num];
	} else {
	    return [];	    
	}
    }

    this.gridDepth = function() {
	return this.levels.length;
    }

    this.now = function() {
	return this.getLevel(0);
    }

    this.next = function() {
	return this.getLevel(1);
    }

    this.later = function() {
	return this.getLevel(2);
    }

    this.laterStill = function() {
	if (this.levels.length < 4) {
	    return [];
	} else {
	    return _.flatten(this.levels.slice(3));
	}
    }

    //private
    this.initializeGrid = function() {
	var sinks = graph.sinks();
	this.addLevel(0, sinks);
	var level = 0;
	var children = sinks;
	do {
	    this.addLevel(level, children);
	    children = this.findChildNodes(this.levels[level]);
	    level += 1;
	} while (children.length > 0) ;
    }

    this.initializeGrid();
}


module.exports = DependencyGrid;
