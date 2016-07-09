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

var LCG = require('./linear-congruential-generator');


/** 
A Linear Congruential Generator Key is intended for user-visible
assigned identity numbers, like userId or projectId.

If it uses a full-period LCG, then assigned numbers from the generated
sequence will hop back and forth in the available space in an
apparently random way, eventually covering every possible value, and
finally returning to the initial seed value.

*/


function LinearCongruentialGeneratorKey(initialSeed, multiplier, 
					increment, modulus,
					initialOffset,
					currentSeed,
					fullLoopCount) {

    this.initialSeed = initialSeed;

    this.lcg = new LCG(currentSeed, multiplier, increment, modulus);

    this.fullPeriod = modulus - 1;

    this.initialOffset = initialOffset;
    this.fullLoopCount = fullLoopCount;
    this.looped = false;

    this.current = function() {
	return this.lcg.value() + this.offset();
    }

    this.offset = function() {	
	return this.initialOffset + (this.fullLoopCount * this.fullPeriod);
    }

    this.next = function() {
	var next = this.lcg.next();
	var offset = this.offset();
	if (next === this.initialSeed) {
	    // change the loop count for the subsequent call to next()
	    this.fullLoopCount = this.fullLoopCount + 1;
	    this.looped = true;
	}
	return next + offset;
    }
}

module.exports = LinearCongruentialGeneratorKey;
