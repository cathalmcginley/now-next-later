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
var LCGKey = require('../../util/linear-congruential-generator-key');

chai.should();

describe('LinearCongruentialGeneratorKey', function() {

  describe('#next()', function() {

      // http://link.springer.com/referenceworkentry/10.1007%2F978-1-4419-5906-5_354
      //     (changing some variable names)
      //
      // "Considering for example" a = 3, c = 5, m = 17, and x0 = 2, "the
      // sequence produced by the linear congruential generator will be
      // [11, 4, 0, 5, 3, 14, 13, 10, 1, 8, 12, 7, 9, 15, 16]"

      var x0=2, a=3, c=5, m=17;
      var offset = 101;
      var expected = [11, 4, 0, 5, 3, 14, 13, 10, 1, 8, 12, 7, 9, 15, 16, 2];
      var expectedWithOffset = [112, 105, 101, 106, 104, 115, 114, 111,
				102, 109, 113, 108, 110, 116, 117, 103,
				128, 121, 117, 122, 120, 131, 130, 127, 
				118, 125, 129, 124, 126, 132, 133, 119];
      var distinctValues = m - 1;
      
      var lcgKey = null;

      beforeEach(function() {
	  lcgKey = new LCGKey(x0, a, c, m, offset, x0, 0);
      });

      it('should calculate the next value, plus the offset', function() {
	  lcgKey.next().should.equal(expected[0] + offset);
      });

      it('should step through the full space twice, increasing the offset', function() {

	  var calculated = [];
	  for (var i=0; i<distinctValues*2; i++) {
	      calculated.push(lcgKey.next());
	  }
	  calculated.should.have.members(expectedWithOffset);
      });
  });
});
