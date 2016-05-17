define(['rif/fuzzy'], function(RifFuzzy) {
    "use strict";

    function variable(expression) {
        return function (state, stack, prefix) {
            var id = expression;
            if (id[0] === ':') {
                id = prefix + id;
            } else if (id.indexOf(':') === -1) {
                id = prefix + ':' + id;
            }
            stack.push(state[id]);
        };
    }

    function constant(expression) {
        var value = expression[0] === '"' ? expression.slice(1,-1) : parseFloat(expression);
        return function (state, stack) {
            stack.push(value);
        };
    }

    function pushOperator(context, operator) {
        if (!operator.unary) {
            while (context.current.operators.length !== 0 && context.current.operators.slice(-1)[0].precedence <= operator.precedence) {
                context.expressions.push(context.current.operators.pop());
            }
        }
        context.current.operators.push(operator);
        context.current.lastWasOperand = false;
    }

    function pushOperand(context, operand) {
        context.expressions.push({ execute: operand });
        context.current.lastWasOperand = true;
    }

    var operators = {
        'unary not': {
            precedence: 1,
            unary: true,
            execute: function (state, stack) {
                stack.push(RifFuzzy.not(stack.pop()));
            }
        },
        'unary un': {
            precedence: 1,
            unary: true,
            execute: function (state, stack) {
                stack.push(RifFuzzy.un(stack.pop()));
            }
        },
        'unary more': {
            precedence: 1,
            unary: true,
            execute: function (state, stack) {
                stack.push(RifFuzzy.more(stack.pop()));
            }
        },
        'unary less': {
            precedence: 1,
            unary: true,
            execute: function (state, stack) {
                stack.push(RifFuzzy.less(stack.pop()));
            }
        },
        'unary -': {
            precedence: 2,
            unary: true,
            execute: function (state, stack) {
                stack.push(-stack.pop());
            }
        },
        'unary +': {
            precedence: 2,
            unary: true,
            execute: function (state, stack) {}
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
                stack.push(RifFuzzy.mod(first, second));
            }
        },
        'rem': {
            precedence: 3,
            execute: function (state, stack) {
                var second = stack.pop();
                var first = stack.pop();
                stack.push(RifFuzzy.rem(first, second));
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
                stack.push(RifFuzzy.difference(stack.pop(), stack.pop()));
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
                stack.push(RifFuzzy.equals(stack.pop(), stack.pop()));
            }
        },
        '=': {
            precedence: 7,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop() == second ? 1.0 : 0.0);
            }
        },
        '!=': {
            precedence: 7,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop() == second ? 0.0 : 1.0);
            }
        },
        '<>': {
            precedence: 7,
            execute: function (state, stack) {
                var second = stack.pop();
                stack.push(stack.pop() == second ? 0.0 : 1.0);
            }
        },
        'and': {
            precedence: 11,
            execute: function (state, stack) {
                stack.push(RifFuzzy.and(stack.pop(), stack.pop()));
            }
        },
        'or': {
            precedence: 12,
            execute: function (state, stack) {
                stack.push(RifFuzzy.or(stack.pop(), stack.pop()));
            }
        },
        'xor': {
            precedence: 12,
            execute: function (state, stack) {
                stack.push(RifFuzzy.xor(stack.pop(), stack.pop()));
            }
        }
    };

    function getOperator(part, context) {
        var op_id = part.toLowerCase();
        if (!context.current.lastWasOperand) {
            op_id = "unary " + op_id;
        }
        return operators[op_id];
    }

    function compileNext(part, context) {
        if (part === '(' ) {
            //console.log("left paren");
        } else if ( part === ')') {
            //console.log("right paren");
        } else {
            var operator = getOperator(part, context);
            if (operator) {
                //console.log("push operator", part);
                pushOperator(context, operator);
            } else if (isNaN(part) && part[0] !== '"') {
                //console.log("push variable", part);
                pushOperand(context, variable(part, context));
            } else {
                //console.log("push console", part);
                pushOperand(context, constant(part));
            }
        }
    }

    var identifierChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._$:";
    function isIdentifier(value) {
        return identifierChars.indexOf(value) >= 0;
    }

    function isSpace(value) {
        return value === ' ';
    }

    function isOperator(part) {
        return operators.hasOwnProperty(part) || operators.hasOwnProperty('unary ' + part);
    }

    function isJoinableIdentifier(part) {
        return (isIdentifier(part[0]) || isSpace(part[0])) && !isOperator(part.toLowerCase());
    }

    function combineOperands(parts) {
        var new_parts = [];
        var length = parts.length;
        for (var i = 0; i < length; ) {
            var part = parts[i++];
            if (isJoinableIdentifier(part)) {
                while (i < length && isJoinableIdentifier(parts[i])) {
                    part += parts[i++];
                }
            }
            part = part.trim();
            if (part != '') {
                new_parts.push(part);
            }
        }
        return new_parts;
    }

    function splitExpression(expression) {
        var parts = [];
        var part = '';
        var in_string = false;
        for (var i = 0; i < expression.length; ++i) {
            var ch = expression[i];
            if (in_string) {
                if (ch === '"') {
                    in_string = false;
                }
            } else if (ch === '"') {
                in_string = true;
                if (part !== '') {
                    parts.push(part);
                    part = '';
                }
            } else if (ch === '(' || ch === ')') {
                parts.push(part);
                part = '';
            } else if (part !== '' && (isSpace(ch) != isSpace(part[0]) || isIdentifier(ch) != isIdentifier(part[0]))) {
                parts.push(part);
                part = '';
            }
            part += ch;
        }
        if (part !== '') {
            if (in_string) {
                console.log("Error: unclosed string: " + part);
                part += '"';
            }
            parts.push(part);
        }
        //console.log('"'+expression+'" yields ', parts);
        return combineOperands(parts);
    }

    function pushRemainingOperators(context) {
        while (context.current.operators.length !== 0) {
            context.expressions.push(context.current.operators.pop());
        }
    }

    function compileParts(parts, context) {
        $.each(parts, function (index, value) {
            compileNext(value, context);
        });
    }

    return {
        compile: function(expression, prefix) {
            //console.log("compile", expression);
            var context = {
                expressions: [],
                prefix: prefix,
                current: {
                    operators: [],
                    lastWasOperand: false
                }
            };
            compileParts(splitExpression(expression), context);
            pushRemainingOperators(context);
            return context.expressions;
        },
        evaluate: function(compiled_expression, parameters, prefix) {
            //console.log("evaluate", compiled_expression);
            var stack = [];
            prefix = prefix || '';
            $.each(compiled_expression, function(index, value) {
                value.execute(parameters, stack, prefix);
            });
            return stack.length === 1 ? stack.pop() : null;
        }
    };
});