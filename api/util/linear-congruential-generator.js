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


/** 
A Linear Congruential Generator creates a pseudo-random sequence defined by
 X[n+1] = (a . X[n] + c) mod m
    where
 m    :: 0 < m           (the modulus)
 a    :: 0 < a < m       (the multiplier)
 c    :: 0 <= c < m      (the increment)
 X[0] :: 0 <= X[0] < m   (the seed, or start value)


As described by Wikipedia
(https://en.wikipedia.org/wiki/Linear_congruential_generator):

"the mixed congruential generator will have a full period for all seed
 values if and only if":

 * m and c "are relatively prime"
 * (a-1) "is divisible by all prime factors of m"
 * (a−1) "is divisible by 4 if m is divisible by 4"


An excellent video which describes this algorithm clearly is here:
https://www.youtube.com/watch?v=PtEivGPxwAI

*/


function LinearCongruentialGenerator(seed, multiplier, increment, modulus) {

    this.seed = seed;
    this.multiplier = multiplier;
    this.increment = increment;
    this.modulus = modulus;

    this.next = function() {
	this.seed = ((this.multiplier * this.seed) + increment) % modulus;
	return this.seed;
    }

    this.value = function() {
	return this.seed;
    }
}

module.exports = LinearCongruentialGenerator;
