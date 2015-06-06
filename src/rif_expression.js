var RifExpression = (function() {
    function variableFunction(expression) {
        return function (state, stack) {
            stack.push(state[expression]);
        }
    }

    function constantFunction(expression) {
        var value = parseFloat(expression);
        return function (state, stack) {
            stack.push(value);
        }
    }

    function notFunction() {
        return function (state, stack) {
            stack.push(1.0-stack.pop());
        };
    }

    function compileNext(context) {
        var part = context.parts[context.index];
        if (part === 'not') {
            context.operators.push(notFunction());
        }
        else if (isNaN(part)) {
            context.expressions.push(variableFunction(part));
        } else {
            context.expressions.push(constantFunction(part));
        }
    }

    return {
        compile: function(expression) {
            if (expression === '') {
                return null;
            }
            var context = {
                parts: expression.split(' '),
                index: 0,
                expressions: [],
                operators: []
            };
            for (context.index = 0; context.index < context.parts.length; ++context.index) {
                compileNext(context);
            }
            while (context.operators.length !== 0) {
                context.expressions.push(context.operators.pop());
            }
            return context.expressions;
        },
        evaluate: function(compiled_expression, parameters) {
            var stack = [];
            $.each(compiled_expression, function(index, value) {
                value(parameters, stack);
            });
            return stack.pop();
        }
    };
})();