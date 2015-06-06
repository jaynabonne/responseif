describe('RifExpression', function() {
    it('should return null for an empty expression', function() {
        expect(RifExpression.compile("")).toBeNull();
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
    xit('should compile a logical AND', function() {
        var expression = RifExpression.compile("var1 and var2");
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 0})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 0, var2: 1})).toBe(0);
        expect(RifExpression.evaluate(expression, {var1: 1, var2: 1})).toBe(1);
        expect(RifExpression.evaluate(expression, {var1: 0.6, var2: 0.5})).toBe(0.5);
    });
});
