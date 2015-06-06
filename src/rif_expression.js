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
            if (expression === '') {
                return null;
            }
            var parts = expression.split(' ');
            var index = 0;
            var part = parts[index];
            if (part === 'not') {
                return function(state) {
                    return 1.0 - variableFunction(parts[index+1])(state);
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