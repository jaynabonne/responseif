describe('RifExpression', function() {
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
    xit('should compile a variable plus a constant', function() {
        var expression = RifExpression.compile("variable+12");
        expect(expression({variable: 1})).toBe(13);
        expect(expression({variable: 401})).toBe(52);
    });
});
