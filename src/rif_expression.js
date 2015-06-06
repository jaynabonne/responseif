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

    function compileExpression(context) {
        var part = context.parts[context.index++];
        if (part === 'not') {
            var f = compileExpression(context);
            return function(state) {
                return 1.0 - f(state);
            }
        }
        else if (isNaN(part)) {
            return variableFunction(part);
        } else {
            return constantFunction(part);
        }
    }

    return {
        compile: function(expression) {
            if (expression === '') {
                return null;
            }
            var context = {
                parts: expression.split(' '),
                index: 0
            }
            return compileExpression(context);
        }
    };
})();