describe("rifTokenize", function () {
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
    it("should trim the value", function () {
        expect(rifTokenize(".token  value and more ")).toEqual(
            [
                {token:"token", value:"value and more"}
            ]
        );
    });
    it("should split on all white space", function () {
        expect(rifTokenize(".token\tA value and more.\r\nAnd another line.\f")).toEqual(
            [
                {token:"token", value:"A value and more.  And another line."}
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
});
