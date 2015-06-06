var RifExpression = (function() {
    function Variable(expression) {
        return function (state, stack) {
            stack.push(state[expression]);
        }
    }

    function Constant(expression) {
        var value = parseFloat(expression);
        return function (state, stack) {
            stack.push(value);
        }
    }

    var Not = function (state, stack) {
        stack.push(1.0-stack.pop());
    };

    var And = function (state, stack) {
        stack.push(Math.min(stack.pop(), stack.pop()));
    };

    var Or = function (state, stack) {
        stack.push(Math.max(stack.pop(), stack.pop()));
    };

    function compileNext(part, context) {
        if (part === '') return;
        if (part === 'not') {
            context.operators.push(Not);
        }
        else if (part === 'and') {
            context.operators.push(And);
        }
        else if (part === 'or') {
            context.operators.push(Or);
        }
        else if (isNaN(part)) {
            context.expressions.push(Variable(part));
        } else {
            context.expressions.push(Constant(part));
        }
    }

    return {
        compile: function(expression) {
            var context = {
                expressions: [],
                operators: []
            };
            $.each(expression.split(' '), function(index, value) {
                compileNext(value, context);
            });
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
            return stack.length === 1 ? stack.pop() : null;
        }
    };
})();