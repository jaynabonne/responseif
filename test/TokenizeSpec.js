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
        expect(tokenize(".token1 value")).toEqual(
            [
                {token:"token1", value:"value"}
            ]
        );
    });
    it("should return token and value with spaces", function () {
        expect(tokenize(".token1 value and more")).toEqual(
            [
                {token:"token1", value:"value and more"}
            ]
        );
    });
    it("should trim the value", function () {
        expect(tokenize(".token1  value and more ")).toEqual(
            [
                {token:"token1", value:"value and more"}
            ]
        );
    });
});
