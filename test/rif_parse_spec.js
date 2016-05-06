define(['rif/parse'], function(rifParse) {
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

    function model(actor) {
        return token_pair("model", actor);
    }

    function end() {
        return token_pair("end");
    }

    it("should return an empty result for an empty input", function () {
        expect(rifParse([])).toEqual({responses: {}, models: {}});
    });
    it("should parse an empty response group", function () {
        var rif = rifParse(
            [
                responses("someObject"),
                end()
            ]
        );
        expect(rif.responses).toEqual({someObject: []});
    });
    it("should parse multiple response groups", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                end(),
                responses("anotherObject"),
                end()
            ]);
        expect(rif.responses).toEqual(
            {
                anObject: [],
                anotherObject: []
            });
    });
    it("should parse a response group with one response", function () {
        var rif = rifParse(
            [
                responses("someObject"),
                response(),
                end()
            ]
        );
        expect(rif.responses).toEqual({someObject: [{id: 0}]});
    });
    it("should parse a response group with two responses", function () {
        var rif = rifParse(
            [
                responses("someObject"),
                response(),
                response(),
                end()
            ]
        );
        expect(rif.responses).toEqual({someObject: [{id: 0}, {id: 1}]});
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
        expect(rif.actions).toEqual({someObject: [{id: 0}, {id: 1}]});
    });
    it("should parse response occurs", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                token_pair("occurs", "42"),
                end()
            ]
        );
        expect(rif.responses).toEqual({anObject: [{id: 0, occurs: 42}]});
    });
    it("should parse response matches", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                token_pair("matches", "topicA topicB topicC"),
                end()
            ]
        );
        expect(rif.responses).toEqual({
            anObject: [{
                id: 0,
                matches: [{keyword: "topicA", weight: 1}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 1}]
            }]
        });
    });
    it("should parse response matches as the response token value", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response("topicA topicB topicC"),
                end()
            ]
        );
        expect(rif.responses).toEqual({
            anObject: [{
                id: 0,
                matches: [{keyword: "topicA", weight: 1}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 1}]
            }]
        });
    });
    it("should parse response matches with weights", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                token_pair("matches", "topicA=50.5 topicB topicC=75"),
                end()
            ]
        );
        expect(rif.responses).toEqual({
            anObject: [{
                id: 0,
                matches: [{keyword: "topicA", weight: 0.505}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 0.75}]
            }]
        });
    });
    it("should parse response needs", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                token_pair("needs", "some expression"),
                token_pair("needs", "some other expression"),
                end()
            ]
        );
        expect(rif.responses).toEqual({anObject: [{id: 0, needs: ["some expression", "some other expression"]}]});
    });
    it("should parse response prompts", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                token_pair("prompts", "A response prompt"),
                end()
            ]
        );
        expect(rif.responses).toEqual({anObject: [{id: 0, prompts: "A response prompt"}]});
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
        expect(rif.responses).toEqual({
            anObject: [
                {id: 0, forcesprompt: true},
                {id: 1, forcesprompt: false},
                {id: 2, forcesprompt: true}
            ]
        });
    });
    it("should parse response is", function () {
        var rif = rifParse([
                responses("anObject"),
                response(),
                token_pair("is", "something"),
                end()
            ]
        );
        expect(rif.responses).toEqual({anObject: [{id: 0, is: "something"}]});
    });
    it("should parse response orders", function () {
        var rif = rifParse([
                responses("anObject"),
                response(),
                token_pair("orders", "99"),
                end()
            ]
        );
        expect(rif.responses).toEqual({anObject: [{id: 0, orders: 99}]});
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
                        id: 0,
                        does: {
                            common: [{says: {text: "some text to display for this response"}}]
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
                        id: 0,
                        does: {
                            common: [{says: {text: "some text to display for this response", into: "someelement"}}]
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
                        id: 0,
                        does: {
                            common: [{says: {text: "some text to display for this response", as: "someclass"}}]
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
                        id: 0,
                        does: {
                            common: [{says: {text: "this text should autohide", autohides: true}}]
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
                token_pair("sets", "expression1"),
                token_pair("sets", "var=expression2"),
                token_pair("sets", "var2"),
                token_pair("to", "expression3"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        id: 0,
                        does: {
                            common: [
                                {sets: {expression: "expression1"}},
                                {sets: {expression: "var=expression2"}},
                                {sets: {expression: "var2", to: "expression3"}}
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
                token_pair("calls", "call1 call2 call3"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        id: 0,
                        does: {
                            common: [{calls: [{keyword: "call1", weight: 1}, {keyword: "call2", weight: 1}, {keyword: "call3", weight: 1}]}]
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
                token_pair("suggests", "topic1=30 topic2 topic3=70"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        id: 0,
                        does: {
                            common: [
                                {
                                    suggests: {
                                        keywords: [
                                            {keyword: "topic1", weight: 0.3},
                                            {keyword: "topic2", weight: 1},
                                            {keyword: "topic3", weight: 0.7}
                                        ]
                                    }
                                }
                            ]
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
                token_pair("adds", "topic1 topic2 topic3"),
                token_pair("adds", "topic4 topic5"),
                token_pair("for", "someone"),
                token_pair("adds", "topic6=50 topic7=90"),
                token_pair("adds", "topicA"),
                token_pair("to", "clusterA"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        id: 0,
                        does: {
                            common: [
                                {adds: {keywords: [{keyword: "topic1", weight: 1}, {keyword: "topic2", weight: 1}, {keyword: "topic3", weight: 1}]}},
                                {adds: {keywords: [{keyword: "topic4", weight: 1}, {keyword: "topic5", weight: 1}], actor: "someone"}},
                                {adds: {keywords: [{keyword: "topic6", weight: 0.5}, {keyword: "topic7", weight: 0.9}]}},
                                {adds: {keywords: [{keyword: "topicA", weight: 1}], cluster: "clusterA"}}
                            ]
                        }
                    }
                ]
            }
        );
    });

    it("should parse response removes", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                does(),
                token_pair("removes", "topic1 topic2 topic3"),
                token_pair("removes", "topic4 topic5"),
                token_pair("for", "someone"),
                token_pair("removes", "topicA"),
                token_pair("from", "clusterA"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        id: 0,
                        does: {
                            common: [
                                {removes: {keywords: [{keyword: "topic1", weight: 1}, {keyword: "topic2", weight: 1}, {keyword: "topic3", weight: 1}]}},
                                {removes: {keywords: [{keyword: "topic4", weight: 1}, {keyword: "topic5", weight: 1}], actor: "someone"}},
                                {removes: {keywords: [{keyword: "topicA", weight: 1}], cluster: "clusterA"}}
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
                        id: 0,
                        does: {
                            common: [{says: {text: "some text in the common case"}}],
                            2: [{says: {text: "some text to display for this response"}}],
                            6: [{says: {text: "some text to display for response 6"}}]
                        }
                    }
                ]
            }
        );
    });
    it("should parse an empty response 'selects'", function () {
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
                        id: 0,
                        selects: []
                    }
                ]
            }
        );
    });
    it("should parse a response 'selects'", function () {
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
                        id: 0,
                        selects: [
                            {id: 1, does: {common: [{says: {text: "some text"}}]}},
                            {id: 2, does: {common: [{says: {text: "some more text"}}]}}
                        ]
                    }
                ]
            }
        );
    });

    it("should parse a response 'uses first'", function () {
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
                        id: 0,
                        does: {
                            common: [{
                                uses: {
                                    first: [
                                        {id: 1, does: {common: [{says: {text: "some text"}}]}},
                                        {id: 2, does: {common: [{says: {text: "some more text"}}]}}
                                    ]
                                }
                            }]
                        }
                    }
                ]
            }
        );
    });
    it("should parse a response 'uses random'", function () {
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
                        id: 0,
                        does: {
                            common: [{
                                uses: {
                                    random: [
                                        {id: 1, does: {common: [{says: {text: "some text"}}]}},
                                        {id: 2, does: {common: [{says: {text: "some more text"}}]}}
                                    ]
                                }
                            }]
                        }
                    }
                ]
            }
        );
    });
    it("should parse a response 'uses all'", function () {
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
                        id: 0,
                        does: {
                            common: [{
                                uses: {
                                    all: [
                                        {id: 1, does: {common: [{says: {text: "some text"}}]}},
                                        {id: 2, does: {common: [{says: {text: "some more text"}}]}}
                                    ]
                                }
                            }]
                        }
                    }
                ]
            }
        );
    });
    it("should parse a response 'uses best'", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            uses("best"),
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
                        id: 0,
                        does: {
                            common: [{
                                uses: {
                                    best: [
                                        {id: 1, does: {common: [{says: {text: "some text"}}]}},
                                        {id: 2, does: {common: [{says: {text: "some more text"}}]}}
                                    ]
                                }
                            }]
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
        expect(rif.sets).toEqual([{expression: "setexpression1"}, {expression: "target", to: "setexpression2"}]);
    });
    it("should parse listeners", function () {
        var rif = rifParse(
            [
                token_pair("listener", "someresponder"),
                token_pair("listener", "otherresponder")
            ]
        );
        expect(rif.listeners).toEqual({someresponder: {}, otherresponder: {}});
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
        expect(rif.moves).toEqual([{target: "object1", to: "parent1"}, {target: "object2", to: "parent2"}]);
    });
    it("should parse response animates", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                response(),
                does(),
                token_pair("animates", "aselector"),
                token_pair("to", "properties"),
                token_pair("lasting", "1000"),
                end()
            ]
        );
        expect(rif.responses).toEqual(
            {
                anObject: [
                    {
                        id: 0,
                        does: {
                            common: [{
                                animates: {
                                    selector: "aselector",
                                    transitions: [{to: "properties", lasting: 1000}]
                                }
                            }]
                        }
                    }
                ]
            }
        );
    });
    it("should parse invokes", function () {
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
                        id: 0,
                        does: {
                            common: [{invokes: "a function body"}]
                        }
                    }
                ]
            }
        );
    });
    it("should parse moves", function () {
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
                        id: 0,
                        does: {
                            common: [{moves: {target: "player", to: "room"}}]
                        }
                    }
                ]
            }
        );
    });
    it("should parse link", function () {
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
                        id: 0,
                        does: {
                            common: [{moves: {target: "player", to: "room"}}]
                        }
                    },
                    {reference: "anotherObject"}
                ]
            }
        );
    });
    it("should parse just a link", function () {
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
                    {reference: "someObject"}
                ],
                anotherObject: [
                    {reference: "someObject"}
                ]

            }
        );
    });
    it("should parse click-effect animates", function () {
        var rif = rifParse(
            [
                token_pair("click-effect"),
                token_pair("to", "properties"),
                token_pair("lasting", "1000"),
                token_pair("to", "other_properties"),
                token_pair("lasting", "2000"),
            ]
        );
        expect(rif.clickEffect).toEqual(
            {
                transitions: [{to: "properties", lasting: 1000}, {to: "other_properties", lasting: 2000}]
            }
        );
    });
    it("should parse resets", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("resets"),
            ]
        );
        expect(rif.responses.anObject[0]).toEqual({
            id: 0,
            does: {
                common: [
                    {
                        resets: {}
                    }
                ]
            }
        });
    });

    it("should parse adjusts", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("adjusts", "variable"),
                            token_pair("toward", "target"),
                            token_pair("stepping", "increment"),
            ]
        );
        expect(rif.responses.anObject[0]).toEqual({
            id: 0,
            does: {
                common: [
                    {
                        adjusts: { variable: 'variable', toward: 'target', stepping: 'increment'}
                    }
                ]
            }
        });
    });

    it("should parse clears", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        does(),
                            token_pair("clears"),
            ]
        );
        expect(rif.responses.anObject[0]).toEqual({
            id: 0,
            does: {
                common: [
                    {
                        clears: {}
                    }
                ]
            }
        });
    });


    it("should parse weights", function () {
        var rif = rifParse(
            [
                responses("anObject"),
                    response(),
                        token_pair("weights", "weight string")
            ]
        );
        expect(rif.responses.anObject[0]).toEqual({ id: 0, weights: 'weight string'});
    });
    describe('model', function() {
        it('should parse an empty model', function() {
            var rif = rifParse(
                [
                    model('actor'),
                    end()
                ]
            );
            expect(rif.models.actor).toEqual({
                clusters: {}
            });
        });
        it('should default to "standard" if no actor is specified', function() {
            var rif = rifParse(
                [
                    model(),
                    end()
                ]
            );
            expect(rif.models.standard).toEqual({
                clusters: {}
            });
        });
        it('should allow defining a cluster', function() {
            var rif = rifParse(
                [
                    model('actor'),
                        token_pair('cluster', 'clustername'),
                    end()
                ]
            );
            expect(rif.models.actor).toEqual({
                clusters: {clustername: {}}
            });
        });
        it('should parse a cluster weight', function() {
            var rif = rifParse(
                [
                    model('actor'),
                        token_pair('cluster', 'clustername'),
                            token_pair('weight', 'expression'),
                    end()
                ]
            );
            expect(rif.models.actor).toEqual({
                clusters: {clustername: { weight: 'expression'}}
            });
        });
        it('should parse a cluster decay', function() {
            var rif = rifParse(
                [
                    model('actor'),
                        token_pair('cluster', 'clustername'),
                            token_pair('decaying', 'expression'),
                    end()
                ]
            );
            expect(rif.models.actor).toEqual({
                clusters: {clustername: { decaying: 'expression'}}
            });
        });
        it('should parse a cluster suggestible state', function() {
            var rif = rifParse(
                [
                    model('actor'),
                        token_pair('cluster', 'clustername'),
                            token_pair('suggestible'),
                    end()
                ]
            );
            expect(rif.models.actor).toEqual({
                clusters: {clustername: { suggestible: true }}
            });
        });
        it('should parse multiple clusters', function() {
            var rif = rifParse(
                [
                    model('actor'),
                    token_pair('cluster', 'cluster1'),
                        token_pair('decaying', 'exp1'),
                    token_pair('cluster', 'cluster2'),
                        token_pair('decaying', 'exp2'),
                    end()
                ]
            );
            expect(rif.models.actor).toEqual({
                clusters: {
                    cluster1: { decaying: 'exp1'},
                    cluster2: { decaying: 'exp2'}
                }
            });
        });
    });
});
});
