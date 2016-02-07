define(['rif_parse'], function(rifParse) {
describe("rifParse", function () {
    "use strict";
    function token_pair(token, value) {
        return {token: token, value: value || ""};
    }
    function responses(name) {
        return token_pair("responses", name);
    }
    function actions(name) {
        return token_pair("actions", name);
    }
    function response(topics) {
        return token_pair("response", topics);
    }
    function says(text) {
        return token_pair("says", text);
    }
    function into(selector) {
        return token_pair("into", selector);
    }
    function as(selector) {
        return token_pair("as", selector);
    }
    function does(slot) {
        return token_pair("does", slot || "");
    }
    function invokes(text) {
        return token_pair("invokes", text);
    }
    function selects() {
        return token_pair("selects");
    }
    function uses(type) {
        return token_pair("uses", type);
    }
    function end() {
        return token_pair("end");
    }

    it("should return an empty result for an empty input", function () {
        expect(rifParse([])).toEqual({responses: {}});
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
    it("should parse actions", function () {
        var rif = rifParse(
            [
                actions("someObject"),
                    response(),
                    response(),
                end()
            ]
        );
        expect(rif.actions).toEqual( { someObject: [{}, {}] } );
    });
    it("should parse response occurs", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("occurs","42"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{occurs: 42}] } );
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
        expect(rif.responses).toEqual( { anObject: [{matches: [{keyword: "topicA"}, {keyword: "topicB"}, {keyword: "topicC"}] }] });
    });
    it("should parse response matches as the response token value", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response("topicA topicB topicC"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{matches: [{keyword: "topicA"}, {keyword: "topicB"}, {keyword: "topicC"}] }] });
    });
    it("should parse response matches with weights", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("matches","topicA=50 topicB topicC=75"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{matches: [{keyword: "topicA", weight: 50}, {keyword: "topicB"}, {keyword: "topicC", weight: 75}] }] });
    });
    it("should parse response needs", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("needs","some expression"),
                        token_pair("needs","some other expression"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{needs: ["some expression", "some other expression"]}] } );
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
    it("should parse response forceprompts", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("forcesprompt"),
                    response(),
                        token_pair("forcesprompt", "false"),
                    response(),
                        token_pair("forcesprompt", "true"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [
            {forcesprompt: true},
            {forcesprompt: false},
            {forcesprompt: true}
        ] } );
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
    it("should parse response orders", function () {
        var rif = rifParse([
                responses("anObject"),
                    response(),
                        token_pair("orders","99"),
                end()
            ]
        );
        expect(rif.responses).toEqual( { anObject: [{orders: 99}] } );
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
                            common: [ { says: { text: "some text to display for this response" } } ]
                        }
                    }
                ]
            }
        );
    });
    it("should parse response does says with into", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            says("some text to display for this response"),
                            into("someelement"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [ { says: { text: "some text to display for this response", into: "someelement" } } ]
                        }
                    }
                ]
            }
        );
    });
    it("should parse response does says with 'as'", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                does(),
                says("some text to display for this response"),
                as("someclass"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [ { says: { text: "some text to display for this response", as: "someclass" } } ]
                        }
                    }
                ]
            }
        );
    });
    it("should parse response does says with autohides", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            says("this text should autohide"),
                            token_pair("autohides"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [ { says: { text: "this text should autohide", autohides: true } } ]
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
                            token_pair("sets","expression1"),
                            token_pair("sets","var=expression2"),
                            token_pair("sets","var2"),
                            token_pair("to","expression3"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [
                                { sets: {expression: "expression1"} },
                                { sets: {expression: "var=expression2"} },
                                { sets: {expression: "var2", to: "expression3"} }
                            ]
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
                            common: [ { calls: [{keyword: "call1"}, {keyword: "call2"}, {keyword: "call3"}] } ]
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
                            common: [ { suggests: [{keyword: "topic1"}, {keyword: "topic2"}, {keyword: "topic3"}] } ]
                        }
                    }
                ]
            }
        );
    });

    it("should parse response adds", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("adds","topic1 topic2 topic3"),
                            token_pair("adds","topic4 topic5"),
                            token_pair("to","someone"),
                            token_pair("adds","topic6=50 topic7=90"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [
                                { adds: [{keyword: "topic1"}, {keyword: "topic2"}, {keyword: "topic3"}] },
                                { adds: [{keyword: "topic4"}, {keyword: "topic5"}], to: "someone" },
                                { adds: [{keyword: "topic6", weight: 50}, {keyword: "topic7", weight: 90}] }
                            ]
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
                            common: [ { says: { text: "some text in the common case"} } ],
                            2: [ { says: { text: "some text to display for this response" } } ],
                            6: [ { says: { text: "some text to display for response 6" } } ]
                        }
                    }
                ]
            }
        );
    });
    it("should parse an empty response 'selects'", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        selects(),
                        end(),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        selects: []
                    }
                ]
            }
        );
    });
    it("should parse a response 'selects'", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        selects(),
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
                        selects: [
                            { does: { common: [ {says: { text: "some text"} } ] } },
                            { does: { common: [ {says: { text: "some more text"} } ] } }
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
                        does(),
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
                        does: {
                            common: [ {
                                uses: {
                                    first: [
                                        {does: {common: [ {says: {text: "some text"} } ] } },
                                        {does: {common: [ {says: {text: "some more text"} } ] } }
                                    ]
                                }
                            } ]
                        }
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
                        does(),
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
                        does: {
                            common: [ {
                                uses: {
                                    random: [
                                        { does: { common: [ {says: { text: "some text"} } ] } },
                                        { does: { common: [ {says: { text: "some more text"} } ] } }
                                    ]
                                }
                            } ]
                        }
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
                        does(),
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
                        does: {
                            common: [ {
                                uses: {
                                    all: [
                                        { does: { common: [ {says: { text: "some text"} } ] } },
                                        { does: { common: [ {says: { text: "some more text"} } ] } }
                                    ]
                                }
                            } ]
                        }
                    }
                ]
            }
        );
    });
    it("should parse a variable being set", function () {
        var rif = rifParse(
            [
                token_pair("set", "setexpression1"),
                token_pair("set", "target"),
                token_pair("to", "setexpression2")
            ]
        );
        expect(rif.sets).toEqual( [{ expression: "setexpression1"} , { expression: "target", to: "setexpression2"}] );
    });
    it("should parse listeners", function () {
        var rif = rifParse(
            [
                token_pair("listener", "someresponder"),
                token_pair("listener", "otherresponder")
            ]
        );
        expect(rif.listeners).toEqual( {someresponder: {}, otherresponder: {}} );
    });
    it("should parse objects being moved", function () {
        var rif = rifParse(
            [
                token_pair("move", "object1"),
                token_pair("to", "parent1"),
                token_pair("move", "object2"),
                token_pair("to", "parent2")
            ]
        );
        expect(rif.moves).toEqual( [{target: "object1", to: "parent1"}, {target: "object2", to: "parent2"}] );
    });
    it("should parse response animates", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("animates","aselector"),
                            token_pair("to","properties"),
                            token_pair("lasting","1000"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [ { animates: { selector: "aselector", transitions: [{to: "properties", lasting: 1000}] }  } ]
                        }
                    }
                ]
            }
        );
    });
    it("should parse invokes", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            invokes("a function body")
            ]
        )
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [ { invokes: "a function body"  } ]
                        }
                    }
                ]
            }
        );
    });
    it("should parse moves", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("moves", "player"),
                            token_pair("to", "room")
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [ { moves: { target: "player", to: "room" }  } ]
                        }
                    }
                ]
            }
        );
    });
    it("should parse link", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("moves", "player"),
                            token_pair("to", "room"),
                    token_pair("reference", "anotherObject"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        does: {
                            common: [ { moves: { target: "player", to: "room" }  } ]
                        }
                    },
                    { reference: "anotherObject"}
                ]
            }
        );
    });
    it("should parse just a link", function() {
        var rif = rifParse(
            [
                responses("anObject"),
                    token_pair("reference", "someObject"),
                end(),
                responses("anotherObject"),
                    token_pair("reference", "someObject"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    { reference: "someObject"}
                ],
                anotherObject: [
                    { reference: "someObject"}
                ]

            }
        );
    });
    it("should parse click-effect animates", function () {
        var rif = rifParse(
            [
                token_pair("click-effect"),
                    token_pair("to","properties"),
                    token_pair("lasting","1000"),
                    token_pair("to","other_properties"),
                    token_pair("lasting","2000"),
            ]
        );
        expect(rif.clickEffect).toEqual(
            {
                transitions: [{to: "properties", lasting: 1000}, {to: "other_properties", lasting: 2000}]
            }
        );
    });
});
});
