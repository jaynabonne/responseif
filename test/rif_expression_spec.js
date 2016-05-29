define(['rif/expression'], function(RifExpression) {
describe('RifExpression', function() {
    it('should return null for an empty expression', function() {
        var expression = RifExpression.compile("");
        expect(RifExpression.evaluate(expression, {})).toBeNull();
    });
    it('should compile a variable', function() {
        var expression = RifExpression.compile("variable");
        expect(RifExpression.evaluate(expression, {'responder:variable': 1}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {'responder:variable': 0}, 'responder')).toBe(0);
    });
    it('should compile a constant', function() {
        var expression = RifExpression.compile("314");
        expect(RifExpression.evaluate(expression, {})).toBe(314);
    });
    it('should compile a logical negation (not)', function() {
        var expression = RifExpression.compile("not variable");
        expect(RifExpression.evaluate(expression, {'responder:variable': 1}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {'responder:variable': 0}, 'responder')).toBe(1);
    });
    it('should compile an "un" expression', function() {
        var expression = RifExpression.compile("un variable");
        expect(RifExpression.evaluate(expression, {'responder:variable': 1}, 'responder')).toBe(-1);
        expect(RifExpression.evaluate(expression, {'responder:variable': 0}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {'responder:variable': -1}, 'responder')).toBe(1);
    });
    it('should compile a "more" expression)', function() {
        var expression = RifExpression.compile("more variable");
        expect(RifExpression.evaluate(expression, {variable: 0.4})).toBeGreaterThan(0.4);
        expect(RifExpression.evaluate(expression, {variable: -0.4})).toBeGreaterThan(-0.4);
    });
    it('should compile a "less" expression)', function() {
        var expression = RifExpression.compile("less variable");
        expect(RifExpression.evaluate(expression, {variable: 0.4})).toBeLessThan(0.4);
        expect(RifExpression.evaluate(expression, {variable: -0.4})).toBeLessThan(-0.4);
    });
    it('should compile a logical negation with a constant', function() {
        var expression = RifExpression.compile("not 1");
        expect(RifExpression.evaluate(expression, {})).toBe(0);
    });
    it('should compile a double logical negation', function() {
        var expression = RifExpression.compile("not not variable");
        expect(RifExpression.evaluate(expression, {'responder:variable': 1}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {'responder:variable': 0}, 'responder')).toBe(0);
    });
    it('should compile a logical AND', function() {
        var expression = RifExpression.compile("var1 and var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 0, "responder:var2": 0}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 0}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0, "responder:var2": 1}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 1}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.6, "responder:var2": 0.5}, 'responder')).toBe(0.5);
    });
    it('should compile a logical OR', function() {
        var expression = RifExpression.compile("var1 or var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 0, "responder:var2": 0}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 0}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0, "responder:var2": 1}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 1}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.6, "responder:var2": 0.5}, 'responder')).toBe(0.6);
    });
    it('should compile a logical XOR', function() {
        var expression = RifExpression.compile("var1 xor var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 0, "responder:var2": 0}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 0}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0, "responder:var2": 1}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 1}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.6, "responder:var2": 0.5}, 'responder')).toBe(0.5);
    });
    it('should give NOT precedence over AND', function() {
        var expression = RifExpression.compile("not var1 and var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 0, "responder:var2": 0}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 0}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0, "responder:var2": 1}, 'responder')).toBe(1);
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 1}, 'responder')).toBe(0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.6, "responder:var2": 0.5}, 'responder')).toBe(0.4);
    });
    it('should give AND precedence over OR', function() {
        var expression = RifExpression.compile("A and B or C");
        expect(RifExpression.evaluate(expression, {"responder:A": 0.5, "responder:B": 0, "responder:C": 0.7}, 'responder')).toBe(0.7);
    });
    it('should work with differently cased words', function() {
        var expression = RifExpression.compile("NOT A aNd B Or C");
        expect(RifExpression.evaluate(expression, {"responder:A": 0.5, "responder:B": 0, "responder:C": 0.7}, 'responder')).toBe(0.7);
    });
    it('should support fuzzy difference', function() {
        var expression = RifExpression.compile("var1 difference var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.5, "responder:var2": 0.7}, 'responder')).toBeCloseTo(0.2);
    });
    it('should support fuzzy equals', function() {
        var expression = RifExpression.compile("var1 equals var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.5, "responder:var2": 0.7}, 'responder')).toBeCloseTo(0.8);
    });
    it('should support double NOT later in the expression', function() {
        var expression = RifExpression.compile("var1 and not not var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 1}, 'responder')).toBe(1.0);
    });
    it('should support addition in the expression', function() {
        var expression = RifExpression.compile("var1 + var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 1}, 'responder')).toBe(2.0);
    });
    it('should support subtraction in the expression', function() {
        var expression = RifExpression.compile("var1 - var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 1.5}, 'responder')).toBe(3.5);
    });
    it('should support multiplication in the expression', function() {
        var expression = RifExpression.compile("var1 * var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 1.5}, 'responder')).toBe(7.5);
    });
    it('should support division in the expression', function() {
        var expression = RifExpression.compile("var1 / var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 6, "responder:var2": 1.5}, 'responder')).toBe(4);
    });
    it('should support mod in the expression', function() {
        var expression = RifExpression.compile("var1 % var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 10, "responder:var2": 4}, 'responder')).toBe(2);
    });
    it('should support > in the expression', function() {
        var expression = RifExpression.compile("var1 > var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 4}, 'responder')).toBe(0.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 5}, 'responder')).toBe(0.0);
    });
    it('should support >= in the expression', function() {
        var expression = RifExpression.compile("var1 >= var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 5}, 'responder')).toBe(0.0);
    });
    it('should support < in the expression', function() {
        var expression = RifExpression.compile("var1 < var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 4}, 'responder')).toBe(0.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 4}, 'responder')).toBe(0.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 5}, 'responder')).toBe(1.0);
    });
    it('should support <= in the expression', function() {
        var expression = RifExpression.compile("var1 <= var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 4}, 'responder')).toBe(0.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 5}, 'responder')).toBe(1.0);
    });
    it('should support = in the expression', function() {
        var expression = RifExpression.compile("var1 = var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 4}, 'responder')).toBe(0.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 5}, 'responder')).toBe(0.0);
    });
    it('should support != in the expression', function() {
        var expression = RifExpression.compile("var1 != var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 4}, 'responder')).toBe(0.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 5}, 'responder')).toBe(1.0);
    });
    it('should support <> in the expression', function() {
        var expression = RifExpression.compile("var1 <> var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 5, "responder:var2": 4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 4}, 'responder')).toBe(0.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 4, "responder:var2": 5}, 'responder')).toBe(1.0);
    });
    it('should support mod (fuzzy truncation) in the expression', function() {
        var expression = RifExpression.compile("var1 mod var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.5, "responder:var2": 0.4}, 'responder')).toBe(0.5);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.4, "responder:var2": 0.4}, 'responder')).toBe(0.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.3, "responder:var2": 0.3}, 'responder')).toBe(0.0);
    });
    it('should support rem (fuzzy rounding) in the expression', function() {
        var expression = RifExpression.compile("var1 rem var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.5, "responder:var2": 0.4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.4, "responder:var2": 0.4}, 'responder')).toBe(1.0);
        expect(RifExpression.evaluate(expression, {"responder:var1": 0.3, "responder:var2": 0.5}, 'responder')).toBe(0.3);
    });
    it('should support symbolic expressions without spaces', function() {
        var expression = RifExpression.compile("var1+var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 1, "responder:var2": 1}, 'responder')).toBe(2);
        expect(RifExpression.evaluate(expression, {"responder:var1": 2, "responder:var2": 3}, 'responder')).toBe(5);
    });
    it('should support unary minus', function() {
        var expression = RifExpression.compile("-13");
        expect(RifExpression.evaluate(expression, {}, 'responder')).toBe(-13);
        expression = RifExpression.compile("-var");
        expect(RifExpression.evaluate(expression, {"responder:var": 13}, 'responder')).toBe(-13);
        expression = RifExpression.compile("var1 - -var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 13, "responder:var2": 9}, 'responder')).toBe(22);
    });
    it('should support unary plus', function() {
        var expression = RifExpression.compile("+13");
        expect(RifExpression.evaluate(expression, {}, 'responder')).toBe(13);
        expression = RifExpression.compile("+var");
        expect(RifExpression.evaluate(expression, {"responder:var": 13}, 'responder')).toBe(13);
        expression = RifExpression.compile("var1 - +var2");
        expect(RifExpression.evaluate(expression, {"responder:var1": 13, "responder:var2": 9}, 'responder')).toBe(4);
    });
    it('should return true for NOT of an undefined variable', function() {
        var expression = RifExpression.compile("not somevar");
        expect(RifExpression.evaluate(expression, {}, 'responder')).toBe(1.0);
    });
    it('should support a string variable', function() {
        var expression = RifExpression.compile('"literal"');
        expect(RifExpression.evaluate(expression, {}, 'responder')).toBe("literal");
    });
    it('should support a string variable with spaces', function() {
        var expression = RifExpression.compile('"a string literal"');
        expect(RifExpression.evaluate(expression, {}, 'responder')).toBe("a string literal");
    });
    it('should compile a relative variable', function() {
        var expression = RifExpression.compile(":variable");
        expect(RifExpression.evaluate(expression, {'responder:variable': 1}, "responder")).toBe(1);
        expect(RifExpression.evaluate(expression, {'responder:variable': 0}, "responder")).toBe(0);
    });
    it('should support a variable with a space in the name', function() {
        var expression = RifExpression.compile("a spaced variable");
        expect(RifExpression.evaluate(expression, {'responder:a spaced variable': 1}, "responder")).toBe(1);
        expect(RifExpression.evaluate(expression, {'responder:a spaced variable': 0}, "responder")).toBe(0);
    });
    it('should support a responder with a space in the name', function() {
        var expression = RifExpression.compile(":variable");
        expect(RifExpression.evaluate(expression, {'a spaced responder:variable': 1}, "a spaced responder")).toBe(1);
        expect(RifExpression.evaluate(expression, {'a spaced responder:variable': 0}, "a spaced responder")).toBe(0);
    });
    it('should support equality check for a string', function() {
        var expression = RifExpression.compile('variable="foo"');
        expect(RifExpression.evaluate(expression, {'responder:variable': 'foo'}, "responder")).toBe(1);
    });
    it('should support parentheses around a bare value', function() {
        var expression = RifExpression.compile('(3)');
        expect(RifExpression.evaluate(expression, {}, "responder")).toBe(3);
    });
    it('should support proper parentheses around a simple expression', function() {
        var expression = RifExpression.compile('(3+5)');
        expect(RifExpression.evaluate(expression, {}, "responder")).toBe(8);
    });
    it('should support proper parentheses around an expression with unaltered precedence', function() {
        var expression = RifExpression.compile('2+(3*5)');
        expect(RifExpression.evaluate(expression, {}, "responder")).toBe(17);
    });
    it('should support proper parentheses around an expression with altered precedence', function() {
        var expression = RifExpression.compile('2*(3+5)');
        expect(RifExpression.evaluate(expression, {}, "responder")).toBe(16);
    });
    it('should support proper parentheses when nested', function() {
        var expression = RifExpression.compile('8/(30 % (20-6))');
        expect(RifExpression.evaluate(expression, {}, "responder")).toBe(4);
    });
    it('should do something reasonable with unbalanced parentheses', function() {
        var expression = RifExpression.compile('8*(3+5))');
        console.log("(NOTE: The previous error output is expected)");
        expect(RifExpression.evaluate(expression, {}, "responder")).toBe(64);
    });
});
});
