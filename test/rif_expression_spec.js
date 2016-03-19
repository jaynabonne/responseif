define(['rif/expression'], function(RifExpression) {
describe('RifExpression', function() {
    it('should return null for an empty expression', function() {
        var expression = RifExpression.compile("");
        expect(RifExpression.evaluate(expression, {})).toBeNull();
    });
    it('should compile a variable', function() {
        var expression = RifExpression.compile("variable");
        expect(RifExpression.evaluate(expression, {variable: 1})).toBe(1);
        expect(RifExpression.evaluate(expression, {variable: 0})).toBe(0);
    });
    it('should compile a constant', function() {
        var expression = RifExpression.compile("314");
        expect(RifExpression.evaluate(expression, {})).toBe(314);
    });
    it('should compile a logical negation (not)', function() {
        var expression = RifExpression.compile("not variable");
        expect(RifExpression.evaluate(expression, {variable: 1})).toBe(0);
        expect(RifExpression.evaluate(expression, {variable: 0})).toBe(1);
    });
    it('should compile an "un" expression', function() {
        var expression = RifExpression.compile("un variable");
        expect(RifExpression.evaluate(expression, {variable: 1})).toBe(-1);
        expect(RifExpression.evaluate(expression, {variable: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {variable: -1})).toBe(1);
    });
    it('should compile a logical negation with a constant', function() {
        var expression = RifExpression.compile("not 1");
        expect(RifExpression.evaluate(expression, {})).toBe(0);
    });
    it('should compile a double logical negation', function() {
        var expression = RifExpression.compile("not not variable");
        expect(RifExpression.evaluate(expression, {variable: 1})).toBe(1);
        expect(RifExpression.evaluate(expression, {variable: 0})).toBe(0);
    });
    it('should compile a logical AND', function() {
        var expression = RifExpression.compile("var1 and var2");
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 1})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 1})).toBe(1);
        expect(RifExpression.evaluate(expression, {var1: 0.6, var2: 0.5})).toBe(0.5);
    });
    it('should compile a logical OR', function() {
        var expression = RifExpression.compile("var1 or var2");
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 0})).toBe(1);
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 1})).toBe(1);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 1})).toBe(1);
        expect(RifExpression.evaluate(expression, {var1: 0.6, var2: 0.5})).toBe(0.6);
    });
    it('should compile a logical XOR', function() {
        var expression = RifExpression.compile("var1 xor var2");
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 0})).toBe(1);
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 1})).toBe(1);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 1})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 0.6, var2: 0.5})).toBe(0.5);
    });
    it('should give NOT precedence over AND', function() {
        var expression = RifExpression.compile("not var1 and var2");
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 1})).toBe(1);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 1})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 0.6, var2: 0.5})).toBe(0.4);
    });
    it('should give AND precedence over OR', function() {
        var expression = RifExpression.compile("A and B or C");
        expect(RifExpression.evaluate(expression, {A: 0.5, B: 0, C: 0.7})).toBe(0.7);
    });
    it('should work with differently cased words', function() {
        var expression = RifExpression.compile("NOT A aNd B Or C");
        expect(RifExpression.evaluate(expression, {A: 0.5, B: 0, C: 0.7})).toBe(0.7);
    });
    it('should support fuzzy difference', function() {
        var expression = RifExpression.compile("var1 difference var2");
        expect(RifExpression.evaluate(expression, {var1: 0.5, var2: 0.7})).toBeCloseTo(0.2);
    });
    it('should support fuzzy equals', function() {
        var expression = RifExpression.compile("var1 equals var2");
        expect(RifExpression.evaluate(expression, {var1: 0.5, var2: 0.7})).toBeCloseTo(0.8);
    });
    it('should support double NOT later in the expression', function() {
        var expression = RifExpression.compile("var1 and not not var2");
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 1})).toBe(1.0);
    });
    it('should support addition in the expression', function() {
        var expression = RifExpression.compile("var1 + var2");
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 1})).toBe(2.0);
    });
    it('should support subtraction in the expression', function() {
        var expression = RifExpression.compile("var1 - var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 1.5})).toBe(3.5);
    });
    it('should support multiplication in the expression', function() {
        var expression = RifExpression.compile("var1 * var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 1.5})).toBe(7.5);
    });
    it('should support division in the expression', function() {
        var expression = RifExpression.compile("var1 / var2");
        expect(RifExpression.evaluate(expression, {var1: 6, var2: 1.5})).toBe(4);
    });
    it('should support mod in the expression', function() {
        var expression = RifExpression.compile("var1 % var2");
        expect(RifExpression.evaluate(expression, {var1: 10, var2: 4})).toBe(2);
    });
    it('should support > in the expression', function() {
        var expression = RifExpression.compile("var1 > var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 4})).toBe(0.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 5})).toBe(0.0);
    });
    it('should support >= in the expression', function() {
        var expression = RifExpression.compile("var1 >= var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 5})).toBe(0.0);
    });
    it('should support < in the expression', function() {
        var expression = RifExpression.compile("var1 < var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 4})).toBe(0.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 4})).toBe(0.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 5})).toBe(1.0);
    });
    it('should support <= in the expression', function() {
        var expression = RifExpression.compile("var1 <= var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 4})).toBe(0.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 5})).toBe(1.0);
    });
    it('should support = in the expression', function() {
        var expression = RifExpression.compile("var1 = var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 4})).toBe(0.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 5})).toBe(0.0);
    });
    it('should support != in the expression', function() {
        var expression = RifExpression.compile("var1 != var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 4})).toBe(0.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 5})).toBe(1.0);
    });
    it('should support <> in the expression', function() {
        var expression = RifExpression.compile("var1 <> var2");
        expect(RifExpression.evaluate(expression, {var1: 5, var2: 4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 4})).toBe(0.0);
        expect(RifExpression.evaluate(expression, {var1: 4, var2: 5})).toBe(1.0);
    });
    it('should support mod (fuzzy truncation) in the expression', function() {
        var expression = RifExpression.compile("var1 mod var2");
        expect(RifExpression.evaluate(expression, {var1: 0.5, var2: 0.4})).toBe(0.5);
        expect(RifExpression.evaluate(expression, {var1: 0.4, var2: 0.4})).toBe(0.0);
        expect(RifExpression.evaluate(expression, {var1: 0.3, var2: 0.3})).toBe(0.0);
    });
    it('should support rem (fuzzy rounding) in the expression', function() {
        var expression = RifExpression.compile("var1 rem var2");
        expect(RifExpression.evaluate(expression, {var1: 0.5, var2: 0.4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 0.4, var2: 0.4})).toBe(1.0);
        expect(RifExpression.evaluate(expression, {var1: 0.3, var2: 0.5})).toBe(0.3);
    });
    it('should support symbolic expressions without spaces', function() {
        var expression = RifExpression.compile("var1+var2");
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 1})).toBe(2);
        expect(RifExpression.evaluate(expression, {var1: 2, var2: 3})).toBe(5);
    });
    it('should support unary minus', function() {
        var expression = RifExpression.compile("-13");
        expect(RifExpression.evaluate(expression, {})).toBe(-13);
        expression = RifExpression.compile("-var");
        expect(RifExpression.evaluate(expression, {var: 13})).toBe(-13);
        expression = RifExpression.compile("var1 - -var2");
        expect(RifExpression.evaluate(expression, {var1: 13, var2: 9})).toBe(22);
    });
    it('should support unary plus', function() {
        var expression = RifExpression.compile("+13");
        expect(RifExpression.evaluate(expression, {})).toBe(13);
        expression = RifExpression.compile("+var");
        expect(RifExpression.evaluate(expression, {var: 13})).toBe(13);
        expression = RifExpression.compile("var1 - +var2");
        expect(RifExpression.evaluate(expression, {var1: 13, var2: 9})).toBe(4);
    });
    it('should return true for NOT of an undefined variable', function() {
        var expression = RifExpression.compile("not somevar");
        expect(RifExpression.evaluate(expression, {})).toBe(1.0);
    });
    it('should support a string variable', function() {
        var expression = RifExpression.compile('"literal"');
        expect(RifExpression.evaluate(expression, {})).toBe("literal");
    });
    it('should support a string variable with spaces', function() {
        var expression = RifExpression.compile('"a string literal"');
        expect(RifExpression.evaluate(expression, {})).toBe("a string literal");
    });
    it('should compile a relative variable', function() {
        var expression = RifExpression.compile(":variable");
        expect(RifExpression.evaluate(expression, {'responder:variable': 1}, "responder")).toBe(1);
        expect(RifExpression.evaluate(expression, {'responder:variable': 0}, "responder")).toBe(0);
        expect(RifExpression.evaluate(expression, {':variable': 0})).toBe(0);
    });
    it('should support a variable with a space in the name', function() {
        var expression = RifExpression.compile("a spaced variable");
        expect(RifExpression.evaluate(expression, {'a spaced variable': 1}, "responder")).toBe(1);
        expect(RifExpression.evaluate(expression, {'a spaced variable': 0}, "responder")).toBe(0);
    });
    it('should support a responder with a space in the name', function() {
        var expression = RifExpression.compile(":variable");
        expect(RifExpression.evaluate(expression, {'a spaced responder:variable': 1}, "a spaced responder")).toBe(1);
        expect(RifExpression.evaluate(expression, {'a spaced responder:variable': 0}, "a spaced responder")).toBe(0);
    });
    it('should support equality check for a string', function() {
        var expression = RifExpression.compile('variable="foo"');
        expect(RifExpression.evaluate(expression, {variable: 'foo'})).toBe(1);
    });
});
});
