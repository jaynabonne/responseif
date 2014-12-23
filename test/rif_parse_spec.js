describe("rifParse", function () {
    function token_pair(token, value) {
        return {token: token, value: value};
    }
    function responses(name) {
        return token_pair("responses", name);
    }
    function response(name) {
        return token_pair("response", "");
    }
    function end() {
        return token_pair("end", "");
    }

    it("should return an empty result for an empty input", function () {
        expect(rifParse([])).toEqual({});
    });
    it("should parse a single object", function () {
        var rif = rifParse( [ {token: "object", value: "anObject"} ] );
        expect(rif.objects).toEqual( { anObject: {} } );
    });
    it("should parse an empty responses set", function () {
        var rif = rifParse(
            [
                responses("someObject"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { someObject: [] } );
    });
    it("should parse multiple objects", function () {
        var rif = rifParse(
            [
                {token: "object", value: "anObject"},
                {token: "object", value: "anotherObject"}
            ] );
        expect(rif.objects).toEqual(
            {
                anObject: {},
                anotherObject: {}
            } );
    });
    it("should parse multiple responses sets", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                end(),
                responses("anotherObject"),
                end()
            ] );
        expect(rif.responses).toEqual(
            {
                anObject: [],
                anotherObject: []
            } );
    });
    it("should parse a responses set with one response", function () {
        var rif = rifParse(
            [
                responses("someObject"),
                    response(),
                end()
            ]
        );
        expect(rif.responses).toEqual( { someObject: [{}] } );
    });
    it("should parse a responses set with two responses", function () {
        var rif = rifParse(
            [
                responses("someObject"),
                    response(),
                    response(),
                end()
            ]
        );
        expect(rif.responses).toEqual( { someObject: [{}, {}] } );
    });
    it("should parse response text", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("text","some text to display for this response"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{text: "some text to display for this response"}] } );
    });
    it("should parse response maxusecount", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("maxusecount","42"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{maxusecount: 42}] } );
    });
    it("should parse response topics", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("topics","topicA topicB topicC"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{topics: ["topicA", "topicB", "topicC"]}] } );
    });
    it("should parse response subtopics", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("subtopics","subtopicA subtopicB subtopicC"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{subtopics: ["subtopicA", "subtopicB", "subtopicC"]}] } );
    });
    it("should parse response needs", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("needs","need1 need2"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{needs: ["need1", "need2"]}] } );
    });
    it("should parse response sets", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("sets","value1 value2 value3"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{sets: ["value1", "value2", "value3"]}] } );
    });
    it("should parse response calls", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("calls","call1 call2 call3"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{calls: ["call1", "call2", "call3"]}] } );
    });
    it("should parse response suggests", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("suggests","topic1 topic2 topic3"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{suggests: ["topic1", "topic2", "topic3"]}] } );
    });
    it("should parse response prompt", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("prompt","A response prompt"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{prompt: "A response prompt"}] } );
    });
    it("should parse response display class", function () {
        var rif = rifParse([
                responses("anObject"),
                    response(),
                        token_pair("display_class","someclass"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{display_class: "someclass"}] } );
    });
});
