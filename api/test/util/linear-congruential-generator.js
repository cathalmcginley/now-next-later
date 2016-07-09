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

var chai = require('chai');
var LCG = require('../../util/linear-congruential-generator');

chai.should();

describe('LinearCongruentialGenerator', function() {

  describe('#next()', function() {

      // http://link.springer.com/referenceworkentry/10.1007%2F978-1-4419-5906-5_354
      //     (changing some variable names)
      //
      // "Considering for example" a = 3, c = 5, m = 17, and x0 = 2, "the
      // sequence produced by the linear congruential generator will be
      // [11, 4, 0, 5, 3, 14, 13, 10, 1, 8, 12, 7, 9, 15, 16]"

      var x0=2, a=3, c=5, m=17;
      var expected = [11, 4, 0, 5, 3, 14, 13, 10, 1, 8, 12, 7, 9, 15, 16, 2];
      var distinctValues = m - 1;
      var lcg = null;

      beforeEach(function() {
	  lcg = new LCG(x0, a, c, m);
      });

      it('should calculate the next value', function() {
	  lcg.next().should.equal(expected[0]);
      });

      it('should step through the full space without duplicates', function() {
	  var calculated = [];
	  for (var i=0; i<distinctValues; i++) {
	      calculated.push(lcg.next());
	  }
	  calculated.should.have.members(expected);
      });
  });
});
