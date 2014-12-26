describe("rifExpand", function () {
    function token_pair(token, value) {
        return {token: token, value: value || ""};
    }
    function define(macro) {
        return token_pair("define", macro);
    }
    function enddef() {
        return token_pair("enddef");
    }
    it("should return an empty array for an empty input", function() {
        var tokens = rifExpand([]);
        expect(tokens).toEqual([]);
    });
    it("should return the same tokens when there are no definitions", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                token_pair("tokenB", "valueB"),
                token_pair("tokenC", "valueC")
            ]
        );
        expect(tokens).toEqual(
            [
                token_pair("tokenA", "valueA"),
                token_pair("tokenB", "valueB"),
                token_pair("tokenC", "valueC")
            ]
        );
    });
    it("should remove empty definitions from the result", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                define("somedef"),
                enddef(),
                token_pair("tokenB", "valueB"),
                token_pair("tokenC", "valueC")
            ]
        );
        expect(tokens).toEqual(
            [
                token_pair("tokenA", "valueA"),
                token_pair("tokenB", "valueB"),
                token_pair("tokenC", "valueC")
            ]
        );
    });
    it("should remove non-empty definitions from the result", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                define("somedef"),
                token_pair("tokenNew", "valueNew"),
                enddef(),
                token_pair("tokenB", "valueB"),
                token_pair("tokenC", "valueC")
            ]
        );
        expect(tokens).toEqual(
            [
                token_pair("tokenA", "valueA"),
                token_pair("tokenB", "valueB"),
                token_pair("tokenC", "valueC")
            ]
        );
    });
    xit("should replace a definition", function () {
        var tokens = rifExpand(
            [
                define("somedef"),
                token_pair("sometoken", "somevalue"),
                token_pair("anothertoken", "anothervalue"),
                enddef(),
                token_pair("firsttoken", "firstvalue"),
                token_pair("somedef"),
                token_pair("secondtoken", "secondvalue"),
            ]
        );
        expect(rif).toEqual( { responses: {} });
    });
});
