describe("rifParse", function () {
    "use strict";
    function token_pair(token, value) {
        return {token: token, value: value || ""};
    }
    function responses(name) {
        return token_pair("responses", name);
    }
    function response(name) {
        return token_pair("response");
    }
    function says(text) {
        return token_pair("says", text);
    }
    function does(slot) {
        return token_pair("does", slot || "");
    }
    function groups() {
        return token_pair("groups");
    }
    function uses(type) {
        return token_pair("uses", type);
    }
    function end() {
        return token_pair("end");
    }

    it("should return an empty result for an empty input", function () {
        expect(rifParse([])).toEqual({});
    });
    it("should parse a single object", function () {
        var rif = rifParse( [ {token: "object", value: "anObject"} ] );
        expect(rif.objects).toEqual( { anObject: {} } );
    });
    it("should parse an empty response set", function () {
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
                token_pair("object", "anObject"),
                token_pair("object", "anotherObject")
            ] );
        expect(rif.objects).toEqual(
            {
                anObject: {},
                anotherObject: {}
            } );
    });
    it("should parse multiple response sets", function () {
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
    it("should parse a response set with one response", function () {
        var rif = rifParse(
            [
                responses("someObject"),
                    response(),
                end()
            ]
        );
        expect(rif.responses).toEqual( { someObject: [{}] } );
    });
    it("should parse a response set with two responses", function () {
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
    it("should parse response runs", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("runs","42"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{runs: 42}] } );
    });
    it("should parse response matches", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("matches","topicA topicB topicC"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{matches: ["topicA", "topicB", "topicC"]}] } );
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
    it("should parse response prompts", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                token_pair("prompts","A response prompt"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{prompts: "A response prompt"}] } );
    });
    it("should parse response is", function () {
        var rif = rifParse([
                responses("anObject"),
                response(),
                token_pair("is","something"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{is: "something"}] } );
    });
    it("should parse response does says", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            says("some text to display for this response"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: { says: { text: "some text to display for this response" } }
                        }
                    }
                ]
            }
        );
    });
    it("should parse response sets", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("sets","value1 value2 value3"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: { sets: ["value1", "value2", "value3"] }
                        }
                    }
                ]
            }
        );
    });
    it("should parse response calls", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("calls","call1 call2 call3"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: { calls: ["call1", "call2", "call3"] }
                        }
                    }
                ]
            }
        );
    });
    it("should parse response suggests", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("suggests","topic1 topic2 topic3"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: { suggests: ["topic1", "topic2", "topic3"] }
                        }
                    }
                ]
            }
        );
    });
    it("should parse response does for other slots", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does("2"),
                            says("some text to display for this response"),
                        does("6"),
                            says("some text to display for response 6"),
                        does(),
                            says("some text in the common case"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: { says: { text: "some text in the common case"} },
                            2: { says: { text: "some text to display for this response" } },
                            6: { says: { text: "some text to display for response 6" } }
                        }
                    }
                ]
            }
        );
    });
    it("should parse an empty response 'groups'", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        groups(),
                        end(),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        groups: []
                    }
                ]
            }
        );
    });
    it("should parse a response 'groups'", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        groups(),
                            response(),
                                does(),
                                    says("some text"),
                            response(),
                                does(),
                                    says("some more text"),
                        end(),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        groups: [
                            { does: { common: {says: { text: "some text"} } } },
                            { does: { common: {says: { text: "some more text"} } } }
                        ]
                    }
                ]
            }
        );
    });

    it("should parse a response 'uses first'", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        uses("first"),
                            response(),
                                does(),
                                    says("some text"),
                            response(),
                                does(),
                                    says("some more text"),
                        end(),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        first: [
                            { does: { common: {says: { text: "some text"} } } },
                            { does: { common: {says: { text: "some more text"} } } }
                        ]
                    }
                ]
            }
        );
    });
    it("should parse a response 'uses random'", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        uses("random"),
                            response(),
                                does(),
                                    says("some text"),
                            response(),
                                does(),
                                    says("some more text"),
                        end(),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        random: [
                            { does: { common: {says: { text: "some text"} } } },
                            { does: { common: {says: { text: "some more text"} } } }
                        ]
                    }
                ]
            }
        );
    });
    it("should parse a response 'uses all'", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        uses("all"),
                            response(),
                                does(),
                                    says("some text"),
                            response(),
                                does(),
                                    says("some more text"),
                        end(),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        all: [
                            { does: { common: {says: { text: "some text"} } } },
                            { does: { common: {says: { text: "some more text"} } } }
                        ]
                    }
                ]
            }
        );
    });
    it("should parse a variable being set", function () {
        var rif = rifParse(
            [
                token_pair("set", "setexpression1"),
                token_pair("set", "setexpression2")
            ]
        );
        expect(rif.sets).toEqual( ["setexpression1", "setexpression2"] );
    });
});
