describe("tokenize", function () {
    it("should return an empty array for empty input", function () {
        expect(tokenize("")).toEqual([]);
    });
    it("should return a single token", function () {
        expect(tokenize(".token")).toEqual(
            [
                {token:"token", value:""}
            ]
        );
    });
    it("should return token and simple value", function () {
        expect(tokenize(".token value")).toEqual(
            [
                {token:"token", value:"value"}
            ]
        );
    });
    it("should return token and value with spaces", function () {
        expect(tokenize(".token value and more")).toEqual(
            [
                {token:"token", value:"value and more"}
            ]
        );
    });
    it("should trim the value", function () {
        expect(tokenize(".token  value and more ")).toEqual(
            [
                {token:"token", value:"value and more"}
            ]
        );
    });
    it("should split on all white space", function () {
        expect(tokenize(".token\tA value and more.\r\nAnd another line.\f")).toEqual(
            [
                {token:"token", value:"A value and more.  And another line."}
            ]
        );
    });
    it("should parse multiple values", function () {
        expect(tokenize(".token1 this is a value .token2 and another one")).toEqual(
            [
                {token:"token1", value:"this is a value"},
                {token:"token2", value:"and another one"}
            ]
        );
    });
    it("should ignore non-tokenized value", function () {
        expect(tokenize("this is a value")).toEqual([]);
    });
});
