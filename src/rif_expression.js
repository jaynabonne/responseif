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
    Not.precedence = 30;

    var And = function (state, stack) {
        stack.push(Math.min(stack.pop(), stack.pop()));
    };
    And.precedence = 20;

    var Or = function (state, stack) {
        stack.push(Math.max(stack.pop(), stack.pop()));
    };
    Or.precedence = 10;

    var Xor = function (state, stack) {
        var a = stack.pop();
        var b = stack.pop();
        stack.push(Math.max(Math.min(1.0-a, b), Math.min(a,1.0-b)));
    };
    Xor.precedence = 10;

    var Difference = function (state, stack) {
        stack.push(Math.abs(stack.pop()-stack.pop()));
    };
    Difference.precedence = 5;

    var Equals = function (state, stack) {
        stack.push(1.0 - Math.abs(stack.pop()-stack.pop()));
    };
    Equals.precedence = 5;

    function pushOperator(context, operator) {
        if (context.expressions.length !== 0) {
            while (context.operators.length !== 0 && context.operators.slice(-1)[0].precedence >= operator.precedence) {
                context.expressions.push(context.operators.pop());
            }
        }
        context.operators.push(operator);
    }

    function pushOperand(context, operand) {
        context.expressions.push(operand);
    }

    var operators = {
        'not': Not,
        'and': And,
        'or': Or,
        'xor': Xor,
        'difference': Difference,
        'equals': Equals
    };

    function compileNext(part, context) {
        if (part === '') return;
        var operator = operators[part.toLowerCase()];
        if (operator) {
            pushOperator(context, operator);
        } else if (isNaN(part)) {
            pushOperand(context, Variable(part));
        } else {
            pushOperand(context, Constant(part));
        }
    }

    function splitExpression(expression) {
        return expression.split(' ');
    }

    return {
        compile: function(expression) {
            var context = {
                expressions: [],
                operators: []
            };
            $.each(splitExpression(expression), function(index, value) {
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