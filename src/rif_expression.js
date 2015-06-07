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

    function pushOperator(context, operator) {
        if (!operator.unary) {
            while (context.operators.length !== 0 && context.operators.slice(-1)[0].precedence <= operator.precedence) {
                context.expressions.push(context.operators.pop());
            }
        }
        context.operators.push(operator);
    }

    function pushOperand(context, operand) {
        context.expressions.push({ execute: operand });
    }

    var operators = {
        'not': {
            precedence: 1,
            unary: true,
            execute: function (state, stack) {
                stack.push(1.0-stack.pop());
            }
        },
        '*': {
            precedence: 3,
            execute: function (state, stack) {
                stack.push(stack.pop()*stack.pop());
            }
        },
        '/': {
            precedence: 3,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop()/second);
            }
        },
        '%': {
            precedence: 3,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop()%second);
            }
        },
        'mod': {
            precedence: 3,
            execute: function (state, stack) {
                var second = stack.pop();
                var first = stack.pop();
                stack.push(first > second ? first : 0.0);
            }
        },
        'rem': {
            precedence: 3,
            execute: function (state, stack) {
                var second = stack.pop();
                var first = stack.pop();
                stack.push(first < second ? first : 1.0);
            }
        },
        '+': {
            precedence: 4,
            execute: function (state, stack) {
                stack.push(stack.pop()+stack.pop());
            }
        },
        '-': {
            precedence: 4,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop()-second);
            }
        },
        'difference': {
            precedence: 4,
            execute: function (state, stack) {
                stack.push(Math.abs(stack.pop()-stack.pop()));
            }
        },
        '>': {
            precedence: 6,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop() > second ? 1.0 : 0.0);
            }
        },
        '>=': {
            precedence: 6,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop() >= second ? 1.0 : 0.0);
            }
        },
        '<': {
            precedence: 6,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop() < second ? 1.0 : 0.0);
            }
        },
        '<=': {
            precedence: 6,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop() <= second ? 1.0 : 0.0);
            }
        },
        'equals': {
            precedence: 7,
            execute: function (state, stack) {
                stack.push(1.0 - Math.abs(stack.pop()-stack.pop()));
            }
        },
        '=': {
            precedence: 6,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop() == second ? 1.0 : 0.0);
            }
        },
        'and': {
            precedence: 11,
            execute: function (state, stack) {
                stack.push(Math.min(stack.pop(), stack.pop()));
            }
        },
        'or': {
            precedence: 12,
            execute: function (state, stack) {
                stack.push(Math.max(stack.pop(), stack.pop()));
            }
        },
        'xor': {
            precedence: 12,
            execute: function (state, stack) {
                var a = stack.pop();
                var b = stack.pop();
                stack.push(Math.max(Math.min(1.0-a, b), Math.min(a,1.0-b)));
            }
        }
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
                value.execute(parameters, stack);
            });
            return stack.length === 1 ? stack.pop() : null;
        }
    };
})();