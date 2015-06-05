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
});
