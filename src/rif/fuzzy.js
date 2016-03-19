define([], function() {
    function defineValue(a) {
        return a || 0.0;
    }
    function stepToward(value, target, increment) {
        increment = increment || 0.6;
        return value + (target - value)*increment/2;
    }
    return {
        not: function(a) {
            return Math.min(1.0 - defineValue(a), 1.0);
        },
        un:  function(a) {
            return 0.0 - defineValue(a);
        },
        equals: function(a, b) {
            return 1.0 - Math.abs(a-b);
        },
        or: function(a, b) {
            return Math.max(a, b);
        },
        and: function(a, b) {
            return Math.min(a, b);
        },
        xor: function(a, b) {
            return Math.max(Math.min(1.0-a, b), Math.min(a,1.0-b), 0);
        },
        mod: function(a, b) {
            return a > b ? a : 0.0;
        },
        rem: function(a, b) {
            return a < b ? a : 1.0;
        },
        difference: function(a, b) {
            return Math.min(Math.abs(a-b), 1.0);
        },
        more: function(value, increment) {
            return stepToward(value, 1, increment);
        },
        less: function(value, increment) {
            return stepToward(value, -1, increment);
        }
    }
});