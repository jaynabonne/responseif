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
    it('should compile a logical negation', function() {
        var expression = RifExpression.compile("not variable");
        expect(RifExpression.evaluate(expression, {variable: 1})).toBe(0);
        expect(RifExpression.evaluate(expression, {variable: 0})).toBe(1);
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
});
