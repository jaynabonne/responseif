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
