/**
 * @fileOverview Implementation of a set data structure
 * @author Jason S. Jones
 * @license MIT
 */
//(function () {
    'use strict';

    /**
     * Creates a new SetDS instance and initializes the underlying data
     * structure
     *
     * @constructor
     * @param {object|string|number} args variable number of arguments to
     *        initialize the set, can be an array or individual arguments
     */
    function SetDS(args) {
        this._items = [];

        if (args) {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] instanceof Array) {
                    for (var j = 0; j < arguments[i].length; j++) {
                        this.add(arguments[i][j]);
                    }
                } else {
                    this.add(arguments[i]);
                }
            }
        }
    }

    /* Functions attached to the SetDS prototype.  All set instances will share
     * these methods, meaning there will NOT be copies made for each
     * instance.  This will be a huge memory savings since there may be several
     * different set instances.
     */
    SetDS.prototype = {

        /**
         * Adds an item to the set.  If the set already contains the item,
         * it is not added.
         *
         * @param {object|string|number} value the data of the item to add to
         *        the set
         * @returns {boolean} true if the item is added to the set; false
         *          otherwise
         */
        add: function (value) {
            if (!this.has(value)) {
                this._items.push(value);
                return true;
            }
            return false;
        },

        /**
         * Removes an item from the set.
         *
         * @param {object|string|number} value the data of the item to remove
         *        from the set
         * @returns {object|string|number} the item that was removed from the
         *          set.  If the item is not in the set, returns null
         */
        remove: function (value) {
            var idx = this._items.indexOf(value);
            if (idx === -1) {
                return null;
            } else {
                return this._items.splice(idx, 1)[0];
            }
        },

        /**
         * Determines of the set contains, or has, the value
         *
         * @param {object|string|number} value the value of the item to find
         *        in the set
         * @returns {boolean} true if the set has the value; false otherwise
         */
        has: function (value) {
            return this._items.indexOf(value) > -1;
        },

        /**
         * Clears all the items from the set
         */
        clear: function () {
            this._items = [];
        },

        /**
         * Returns the size, or number of items in the set
         *
         * @returns {number} the number of items in the set
         */
        size: function () {
            return this._items.length;
        },

        /**
         * Determines if the set is empty
         *
         * @returns {boolean} true if the set is empty, false otherwise
         */
        isEmpty: function () {
            return this.size() === 0;
        },

        /**
         * Returns an array containing all the items in the set
         *
         * @returns {object} array of all the items in the set
         */
        values: function () {
            return this._items;
        },

        /**
         * Returns a SetDS that is the union of this set and the 'otherSetDS'.  The
         * returned set will contain all the elements from both sets, and by
         * definition, will not contain any duplicates.
         *
         * @param {object} otherSetDS the set to union with this
         * @returns {object} a set which is a union of this and the 'otherSetDS'
         *
         * @throws {TypeError} if 'otherSetDS' is not a SetDS
         */
        union: function (otherSetDS) {
            // if the 'otherSetDS' is not a SetDS, throw TypeError
            if (!(otherSetDS instanceof SetDS)) {
                throw new TypeError('invalid parameter type; a SetDS is required');
            }

            // create the set to return and initialize with the values from
            // this set
            var unionSetDS = new SetDS(this.values());

            // get array of values from the fn parameter
            var argValues = otherSetDS.values();

            for (var i = 0; i < argValues.length; i++) {
                unionSetDS.add(argValues[i]);
            }
            return unionSetDS;
        },

        /**
         * Returns a SetDS that ts the intersection of this set and the 'otherSetDS',
         * The returned set will have only those items that both sets have in
         * common.
         *
         * @param {object} otherSetDS the set to intersect with this
         * @returns {object} a set which is an intersection of this and the 'otherSetDS'
         *
         * @throws {TypeError} if 'otherSetDS' is not a SetDS
         */
        intersection: function (otherSetDS) {
            // if the 'otherSetDS' is not a SetDS, throw TypeError
            if (!(otherSetDS instanceof SetDS)) {
                throw new TypeError('invalid parameter type; a SetDS is required');
            }

            var intersectionSetDS = new SetDS();
            var theseValues = this.values();

            for (var i = 0; i < theseValues.length; i++) {
                if (otherSetDS.has(theseValues[i])) {
                    intersectionSetDS.add(theseValues[i]);
                }
            }
            return intersectionSetDS;
        },

        /**
         * Returns a SetDS that ts the different of this and the 'otherSetDS',  The
         * returned set will have those items that are contained in this set, but
         * NOT contained in the 'otherSetDS'.
         *
         * @param {object} otherSetDS the set to use to determine the difference
         * @returns {object} a set which is an difference of this and the 'otherSetDS'
         *
         * @throws {TypeError} if 'otherSetDS' is not a SetDS
         */
        difference: function (otherSetDS) {
            // if the 'otherSetDS' is not a SetDS, throw TypeError
            if (!(otherSetDS instanceof SetDS)) {
                throw new TypeError('invalid parameter type; a SetDS is required');
            }

            var differenceSetDS = new SetDS();
            var theseValues = this.values();

            for (var i = 0; i < theseValues.length; i++) {
                if (!otherSetDS.has(theseValues[i])) {
                    differenceSetDS.add(theseValues[i]);
                }
            }

            return differenceSetDS;
        },

        /**
         * Returns whether or not this set is a subset of the 'otherSetDS'.  If all
         * items of this set are contained in the otherSetDS, this function returns
         * true; false otherwise.
         *
         * @param {object} otherSetDS the set to use to determine if this set is a subset
         * @returns {boolean} true if this set is a subset of the 'otherSetDS', false
         *          otherwise
         *
         * @throws {TypeError} if 'otherSetDS' is not a SetDS
         */
        subset: function (otherSetDS) {
            // if the 'otherSetDS' is not a SetDS, throw TypeError
            if (!(otherSetDS instanceof SetDS)) {
                throw new TypeError('invalid parameter type; a SetDS is required');
            }

            // if the size of this set is greater than the size of the otherSetDS,
            // we know this cannot be a subset of the otherSetDS
            if (this.size() > otherSetDS.size()) {
                return false;
            } else {
                var values = this.values();
                for (var i = 0; i < values.length; i++) {
                    if (!otherSetDS.has(values[i])) {
                        return false;
                    }
                }
                return true;
            }
        }
    };

    /*
     * Expose SetDS
     */
    //module.exports = SetDS;
////console.log(SetDS);
//}());
