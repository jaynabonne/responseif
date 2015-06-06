describe('RifExpression', function() {
    it('should return null for an empty expression', function() {
        expect(RifExpression.compile("")).toBeNull();
    });
    it('should compile a variable', function() {
        var expression = RifExpression.compile("variable");
        expect(expression({variable: 1})).toBe(1);
        expect(expression({variable: 0})).toBe(0);
    });
    it('should compile a constant', function() {
        var expression = RifExpression.compile("314");
        expect(expression()).toBe(314);
    });
    it('should compile a logical negation', function() {
        var expression = RifExpression.compile("not variable");
        expect(expression({variable: 1})).toBe(0);
        expect(expression({variable: 0})).toBe(1);
    });
    it('should compile a logical negation with a constant', function() {
        var expression = RifExpression.compile("not 1");
        expect(expression({})).toBe(0);
    });
    it('should compile a double logical negation', function() {
        var expression = RifExpression.compile("not not variable");
        expect(expression({variable: 1})).toBe(1);
        expect(expression({variable: 0})).toBe(0);
    });
});
