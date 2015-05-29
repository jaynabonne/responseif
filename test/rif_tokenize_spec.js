describe("rifTokenize", function () {
    "use strict";
    it("should return an empty array for empty input", function () {
        expect(rifTokenize("")).toEqual([]);
    });
    it("should return a single token", function () {
        expect(rifTokenize(".token")).toEqual(
            [
                {token:"token", value:""}
            ]
        );
    });
    it("should return token and simple value", function () {
        expect(rifTokenize(".token value")).toEqual(
            [
                {token:"token", value:"value"}
            ]
        );
    });
    it("should return token and value with spaces", function () {
        expect(rifTokenize(".token value and more")).toEqual(
            [
                {token:"token", value:"value and more"}
            ]
        );
    });
    it("should return token and value with commas", function () {
        expect(rifTokenize(".token value, and more")).toEqual(
            [
                {token:"token", value:"value, and more"}
            ]
        );
    });
    it("should trim the value", function () {
        expect(rifTokenize(".token  value and more ")).toEqual(
            [
                {token:"token", value:"value and more"}
            ]
        );
    });
    it("should split on all white space", function () {
        expect(rifTokenize(".token\tA value and more.\fAnd another line.")).toEqual(
            [
                {token:"token", value:"A value and more. And another line."}
            ]
        );
    });
    it("should parse multiple values", function () {
        expect(rifTokenize(".token1 this is a value .token2 and another one")).toEqual(
            [
                {token:"token1", value:"this is a value"},
                {token:"token2", value:"and another one"}
            ]
        );
    });
    it("should ignore non-tokenized value", function () {
        expect(rifTokenize("this is a value")).toEqual([]);
    });
    it("should insert line attributes at line breaks in full token/value pairs", function() {
        expect(rifTokenize(".token1 value1\n.token2 value2\n.token3 value3")).toEqual(
            [
                {token: "token1", value:"value1"},
                {token: "token2", value:"value2", line:2},
                {token: "token3", value:"value3", line:3}
            ]
        );
    });
    it("should insert line attributes at line breaks with dangling or split values", function() {
        expect(rifTokenize(".token1 value1\nvalue2\n.token3\nvalue3")).toEqual(
            [
                {token: "token1", value:"value1 value2"},
                {token: "token3", value:"value3", line:3},
            ]
        );
    });
    it("should join values across multiple lines", function() {
        expect(rifTokenize(".token1 value1\nvalue2\nvalue3")).toEqual(
            [
                {token: "token1", value:"value1 value2 value3"},
            ]
        );
    });
});
