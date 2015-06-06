var RifExpression = (function() {
    function variableFunction(expression) {
        return function (state) {
            return state[expression];
        }
    }

    function constantFunction(expression) {
        var value = parseFloat(expression);
        return function (state) {
            return value;
        }
    }

    return {
        compile: function(expression) {
            var parts = expression.split(' ');
            var part = parts[0];
            if (part === 'not') {
                return function(state) {
                    return 1.0 - variableFunction(parts[1])(state);
                }
            }
            else if (isNaN(expression)) {
                return variableFunction(expression);
            } else {
                return constantFunction(expression);
            }
        }
    };
})();