var RifExpression = (function() {
    function variableFunction(expression) {
        return function (state) {
            return state[expression];
        }
    }

    return {
        compile: function(expression) {
            if (isNaN(expression)) {
                return variableFunction(expression);
            } else {
                var value = parseFloat(expression);
                return function(state) {
                    return value;
                }
            }
        }
    };
})();