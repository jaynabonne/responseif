describe("rifExpand", function () {
    "use strict";
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
        var tokens;
        rifExpand([], function(parsed_tokens) {
            tokens = parsed_tokens;
        });
        expect(tokens).toEqual([]);
    });
    it("should return the same tokens when there are no definitions", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                token_pair("tokenB", "valueB"),
                token_pair("tokenC", "valueC")
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenC", "valueC")
                    ]
                );
            }
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
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenC", "valueC")
                    ]
                );
            }
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
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenC", "valueC")
                    ]
                );
            }
        );
    });
    it("should replace a definition in the result", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                define("somedef"),
                token_pair("tokenNew", "valueNew"),
                enddef(),
                token_pair("tokenB", "valueB"),
                token_pair("somedef"),
                token_pair("tokenC", "valueC")
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenNew", "valueNew"),
                        token_pair("tokenC", "valueC")
                    ]
                );
            }
        );
    });
    it("should replace a value in the definition result", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                define("somedef"),
                token_pair("tokenNew"),
                token_pair("<value>"),
                enddef(),
                token_pair("tokenB", "valueB"),
                token_pair("somedef", "repvalue"),
                token_pair("tokenC", "valueC"),
                token_pair("somedef", "repvalue2"),
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenNew", "repvalue"),
                        token_pair("tokenC", "valueC"),
                        token_pair("tokenNew", "repvalue2"),
                    ]
                );
            }
        );
    });
    it("should append the value to the one in the definition ", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                define("somedef"),
                token_pair("tokenNew", "somevalue"),
                token_pair("<value>"),
                enddef(),
                token_pair("tokenB", "valueB"),
                token_pair("somedef", "repvalue"),
                token_pair("tokenC", "valueC"),
                token_pair("somedef", "repvalue2"),
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenNew", "somevalue repvalue"),
                        token_pair("tokenC", "valueC"),
                        token_pair("tokenNew", "somevalue repvalue2"),
                    ]
                );
            }
        );
    });
    it("should append the value's current value to the result", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                define("somedef"),
                token_pair("tokenNew", "somevalue"),
                token_pair("<value>", "values_value"),
                enddef(),
                token_pair("tokenB", "valueB"),
                token_pair("somedef", "repvalue"),
                token_pair("tokenC", "valueC"),
                token_pair("somedef", "repvalue2"),
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenNew", "somevalue repvalue values_value"),
                        token_pair("tokenC", "valueC"),
                        token_pair("tokenNew", "somevalue repvalue2 values_value"),
                    ]
                );
            }
        );
    });
    it("should replace a recursive definition in the result", function() {
        var tokens = rifExpand(
            [
                define("somedef"),
                token_pair("tokenNew", "valueNew"),
                enddef(),

                define("someotherdef"),
                token_pair("somedef"),
                enddef(),

                token_pair("tokenA", "valueA"),
                token_pair("tokenB", "valueB"),
                token_pair("someotherdef"),
                token_pair("tokenC", "valueC")
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenNew", "valueNew"),
                        token_pair("tokenC", "valueC")
                    ]
                );
            }
        );
    });
    it("should strip out comments", function() {
        var tokens = rifExpand(
            [
                token_pair("tokenA", "valueA"),
                token_pair("/", "some long value"),
                token_pair("tokenB", "valueB"),
                token_pair("-", "some long value"),
                token_pair("tokenC", "valueC"),
                token_pair("#otherrandomtext", "some really long value")
            ],
            function(tokens) {
                expect(tokens).toEqual(
                    [
                        token_pair("tokenA", "valueA"),
                        token_pair("tokenB", "valueB"),
                        token_pair("tokenC", "valueC")
                    ]
                );
            }
        );
    });

});
