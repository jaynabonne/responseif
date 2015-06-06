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
        var expression;
        if (part === 'not') {
            var exp_index = context.expressions.length;
            compileExpression(context);
            var f = context.expressions.pop();
            expression = function(state) {
                return 1.0 - f(state);
            }
        }
        else if (isNaN(part)) {
            expression = variableFunction(part);
        } else {
            expression = constantFunction(part);
        }
        context.expressions.push(expression);
    }

    return {
        compile: function(expression) {
            if (expression === '') {
                return null;
            }
            var context = {
                parts: expression.split(' '),
                index: 0,
                expressions: []
            };
            compileExpression(context);
            return context.expressions[0];
        },
        evaluate: function(compiled_expression, parameters) {
            return compiled_expression(parameters);
        }
    };
})();