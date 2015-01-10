describe("ResponseLib", function () {
    "use strict";
    var responseLib;
    var interact;
    beforeEach(function () {
        interact = {};
        responseLib = new ResponseLib(interact);
    });

    describe("responseIsEligible", function () {
        it("returns true for a simple response", function () {
            expect(responseLib.responseIsEligible({})).toEqual(true);
        });
        it("returns false if the run equals or exceeds its runs", function () {
            var response = { run: 5, runs: 5 };
            expect(responseLib.responseIsEligible(response)).toEqual(false);
        });
        it("returns false if required state is not set", function () {
            interact.getState = function(id) { return false; };
            var response = { needs: ["somestate"] };
            expect(responseLib.responseIsEligible(response)).toEqual(false);
        });
        it("returns false if disallowed state is set", function () {
            interact.getState = function(id) { return false; };
            var response = { needs: ["!somestate"] };
            expect(responseLib.responseIsEligible(response)).toEqual(true);
        });
        it("returns correct value for multiple state", function () {
            interact.getState = function(id) { return id === "somestate"; };
            var response = { needs: ["somestate", "!someotherstate"] };
            expect(responseLib.responseIsEligible(response)).toEqual(true);
        });
        it("returns false if required topics are not present", function () {
            var response = { matches: ["*atopic"] };
            expect(responseLib.responseIsEligible(response, ["btopics"])).toEqual(false);
        });
        it("passes the responder as state prefix if passed", function () {
            interact.getState = function(id) { return id === "aresponder.somestate"; };
            var response = { needs: ["somestate"] };
            expect(responseLib.responseIsEligible(response, [], "aresponder")).toEqual(true);
        });
        it("passes the responder as state prefix if passed (negative)", function () {
            interact.getState = function(id) { return id !== "aresponder.somestate"; };
            var response = { needs: ["!somestate"] };
            expect(responseLib.responseIsEligible(response, [], "aresponder")).toEqual(true);
        });
    });
    describe("computeScore", function () {
        it("returns 10000 if response topics is undefined", function () {
            var topics = [],
                score = responseLib.computeScore(undefined, topics);
            expect(score).toEqual(10000);
        });
        it("returns 10000 if response topics is empty", function () {
            var response_topics = [],
                topics = [],
                score = responseLib.computeScore(response_topics, topics);
            expect(score).toEqual(10000);
        });
        it("returns 0 if response topic doesn't match any topics", function () {
            var response_topics = ["atopic"],
                topics = ["btopic"],
                score = responseLib.computeScore(response_topics, topics);
            expect(score).toEqual(0);
        });
        it("returns 10000 if response topic matches any topic", function () {
            var response_topics = ["atopic"],
                topics = ["atopic"],
                score = responseLib.computeScore(response_topics, topics);
            expect(score).toEqual(10000);
        });
        it("returns higher score for multiple matching topics", function() {
            var response_topics = ["atopic", "btopic"],
                topics = ["atopic", "btopic", "ctopic"],
                score = responseLib.computeScore(response_topics, topics);
            expect(score).toEqual(20000);
        });
        it("returns the right score for required topics", function () {
            var response_topics = ["*atopic", "btopic"],
                topics = ["atopic", "btopic"],
                score = responseLib.computeScore(response_topics, topics);
            expect(score).toEqual(20000);
        });
    });
    describe("selectResponses", function () {
        it("returns an empty list for no input", function () {
            var candidates = responseLib.selectResponses([], []);
            expect(candidates).toEqual([]);
        });
        it("returns all simple responses with score 10000", function () {
            var responses = [{a: 1}, {b: 2}, {c: 3}];
            var topics = [];
            var candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: {a: 1}, score: 10000}, {response: {b: 2}, score: 10000},{response: {c: 3}, score: 10000}]);
        });
        it("returns the responder in the responses if passed", function () {
            var response = {a: 1};
            var responder = { a: 314 };
            var candidates = responseLib.selectResponses([response], [], responder);
            expect(candidates).toEqual([{response: response, score: 10000, responder: responder}]);
        });

        it("returns responses that match a topic", function () {
            var response1 = {a: 1, matches: ["atopic"]},
                response2 = {b: 2, matches: ["btopic"]},
                response3 = {c: 3, matches: ["atopic"]},
                responses = [response1, response2, response3],
                topics = ["atopic"],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: response1, score: 10000}, {response: response3, score: 10000}]);
        });
        it("returns responses that match one of multiple topics", function () {
            var response1 = {a: 1, matches: ["atopic"]},
                response2 = {b: 2, matches: ["btopic"]},
                response3 = {c: 3, matches: ["atopic"]},
                response4 = {d: 4, matches: ["ctopic"]},
                responses = [response1, response2, response3, response4],
                topics = ["btopic", "ctopic"],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: response2, score: 10000}, {response: response4, score: 10000}]);
        });
        it("returns a higher score for more matched topics", function () {
            var response1 = {a: 1, matches: ["atopic", "btopic"]},
                response2 = {b: 2, matches: ["btopic"]},
                responses = [response1, response2],
                topics = ["atopic", "btopic"],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: response1, score: 20000}, {response: response2, score: 10000}]);
        });
        it("returns responses whose count does not exceed maxcount", function () {
            var response1 = {a: 1, runs: 10},
                response2 = {b: 2, run: 4, runs: 4 },
                response3 = {c: 3},
                response4 = {d: 4, run: 5 },
                responses = [response1, response2, response3, response4],
                topics = [],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: response1, score: 10000}, {response: response3, score: 10000}, {response: response4, score: 10000}]);
        });
        it("returns the right score for a required topic", function () {
            var response1 = {a: 1, matches: ["*atopic"]},
                responses = [response1],
                topics = ["atopic"],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: response1, score: 10000}]);
        });
        it("returns eligible child responses", function () {
            var response1 = {a: 1, matches: ["atopic"]},
                response2 = {b: 2, matches: ["btopic"]},
                response3 = {c: 3},
                response4 = {d: 4, run: 4, runs: 4 },
                parentresponse = { groups: [response1, response2, response3, response4] },
                responses = [parentresponse],
                topics = ["atopic"],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: response1, score: 10000}, {response: response3, score: 10000}]);
        });
        it("does not return eligible child responses if the parent is ineligible", function () {
            var response1 = {a: 1},
                parentresponse = { matches:["*atopic"], groups: [response1] },
                responses = [parentresponse],
                topics = [],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([]);
        });
    });
    describe("getPriorityResponses", function () {
        it("returns an empty list for no input", function () {
            var responses = responseLib.getPriorityResponses([]);
            expect(responses).toEqual([]);
        });
        it("returns a single entry", function () {
            var response1 = {a: 1, score: 10000};
            var responses = responseLib.getPriorityResponses([response1]);
            expect(responses).toEqual([response1]);
        });
        it("returns the entry with the higher score for two entries", function () {
            var response1 = {a: 1, score: 10000};
            var response2 = {a: 2, score: 20000};
            var responses = responseLib.getPriorityResponses([response1, response2]);
            expect(responses).toEqual([response2]);
        });
        it("returns all the entries with the highest score", function () {
            var response1 = {a: 1, score: 10000};
            var response2 = {a: 2, score: 20000};
            var response3 = {a: 3, score: 20000};
            var response4 = {a: 4, score: 15000};
            var responses = responseLib.getPriorityResponses([response1, response2, response3, response4]);
            expect(responses).toEqual([response2, response3]);
        });
    });
    describe("processResponses", function () {
        describe("general", function () {
            it("increments the response run count by one", function () {
                var candidate = { response: { }, score: 10000 };
                var candidates = [candidate];
                responseLib.processResponses(candidates);
                expect(candidate.response.run).toBe(1);
                responseLib.processResponses(candidates);
                expect(candidate.response.run).toBe(2);
            });
            it("groups responses by type", function () {
                var output = "";
                interact.say = function(says) { output += says.text; };
                responseLib.setTypes(["a","b","c"]);
                var responses = [
                    { response: { is:"c", does: {common: {says: { text: "C!"} }}}, score: 10000 },
                    { response: { is:"b", does: {common: {says: { text: "B!"} }}}, score: 10000 },
                    { response: { is:"a", does: {common: {says: { text:  "A!"} }}}, score: 10000 },
                    { response: { is:"b", does: {common: {says: { text:  "B again!"} }}}, score: 10000 }
                ];
                responseLib.processResponses(responses);
                expect(output).toEqual("A!B!B again!C!");
            });
        });
        describe("says", function () {
            it("text for a matching response", function() {
                interact.say = jasmine.createSpy("say");
                var candidate = {
                    response: {
                        does: { common: { says: { text: "Hello world!" } } }
                    }, score: 10000 };
                responseLib.processResponses([candidate]);
                expect(interact.say).toHaveBeenCalledWith({ text: "Hello world!" }, candidate.response);
            });
            it("no text for no matching responses", function() {
                interact.say = jasmine.createSpy("say");
                responseLib.processResponses([]);
                expect(interact.say).not.toHaveBeenCalled();
            });
            it("text for all matching responses", function() {
                interact.say = jasmine.createSpy("say");
                var candidate1 = { response: { does: { common: {says: { text: "Hello world!"} }}}, score: 10000 };
                var candidate2 = { response: { does: { common: {says: { text: "Goodnight moon!"} }}}, score: 10000 };
                responseLib.processResponses([candidate1, candidate2]);
                expect(interact.say.callCount).toEqual(2);
                expect(interact.say.argsForCall[0]).toEqual([{ text: "Hello world!" }, candidate1.response]);
                expect(interact.say.argsForCall[1]).toEqual([{ text: "Goodnight moon!" }, candidate2.response]);
            });
            it("text only for matching responses that have text", function() {
                interact.say = jasmine.createSpy("say");
                var candidate1 = { response: { }, score: 10000 };
                var candidate2 = { response: { does: { common: {says: { text: "See ya later!"} }}}, score: 10000 };
                responseLib.processResponses([candidate1, candidate2]);
                expect(interact.say.callCount).toEqual(1);
                expect(interact.say.argsForCall[0]).toEqual([{ text: "See ya later!" }, candidate2.response]);
            });
            it("text in proper sequence", function() {
                interact.say = jasmine.createSpy("say");
                var candidate = {
                    response: {
                        does: {
                            common: {says: { text: "See ya later!"} },
                            1: {says: { text: "Hello world!"} },
                            3: {says: { text: "I'm going"} }
                        }
                    },
                    score: 10000
                };
                var candidates = [candidate];
                responseLib.processResponses(candidates);
                responseLib.processResponses(candidates);
                responseLib.processResponses(candidates);
                responseLib.processResponses(candidates);
                expect(interact.say.argsForCall).toEqual([
                    [{ text: "Hello world!"}, candidate.response],
                    [{ text: "See ya later!"}, candidate.response],
                    [{ text: "I'm going"}, candidate.response],
                    [{ text: "See ya later!"}, candidate.response]
                ]);
            });
        });
        describe("prompts", function () {
            it("shows prompts in a menu", function () {
                interact.choose = jasmine.createSpy("choose");
                var candidate1 = {response: {prompts: "Go north"}, score: 10000};
                var candidate2 = {response: {prompts: "Go south"}, score: 10000};
                responseLib.processResponses([candidate1, candidate2]);
                expect(interact.choose).toHaveBeenCalledWith(["Go north", "Go south"], jasmine.any(Function));
            });
            it("processes a single prompt as a normal response", function () {
                interact.say = jasmine.createSpy("say");
                interact.choose = jasmine.createSpy("choose");
                var candidate1 = { response: { prompts: "Go north", does: { common: { says: "something" } } }, score: 10000 };
                responseLib.processResponses([candidate1]);
                expect(interact.choose).not.toHaveBeenCalled();
                expect(interact.say).toHaveBeenCalled();
            });
            it("processes a single prompt as a prompt if 'forcesprompt' is set", function () {
                interact.choose = jasmine.createSpy("choose");
                var candidate1 = { response: { prompts: "Go north", forcesprompt: true }, score: 10000 };
                responseLib.processResponses([candidate1]);
                expect(interact.choose).toHaveBeenCalledWith(["Go north"], jasmine.any(Function));
            });
            it("passes a callback function to be invoked when an item is chosen", function () {
                interact.choose = jasmine.createSpy("choose");
                interact.say = jasmine.createSpy("say");
                var candidate1 = { response: { prompts: "Go north", does: { common: { says: { text: "North" } } } }, score: 10000 };
                var candidate2 = { response: { prompts: "Go south", does: { common: { says: { text: "South" } } }  }, score: 10000 };
                responseLib.processResponses([candidate1, candidate2]);
                var callback = interact.choose.mostRecentCall.args[1];
                callback(1);
                expect(interact.say).toHaveBeenCalledWith({text: "South"}, candidate2.response);
            });
            it("does nothing if the menu callback is called with -1", function () {
                interact.choose = jasmine.createSpy("choose");
                interact.say = jasmine.createSpy("say");
                var candidate1 = { response: { prompts: "Go north", does: { common: { says: { text: "North" } } } }, score: 10000 };
                var candidate2 = { response: { prompts: "Go south", does: { common: { says: { text: "South" } } }  }, score: 10000 };
                responseLib.processResponses([candidate1, candidate2]);
                var callback = interact.choose.mostRecentCall.args[1];
                callback(-1);
                expect(interact.say).not.toHaveBeenCalled();
            });
            it ("combines multiple responses with the same prompt under one menu choice", function () {
                interact.choose = jasmine.createSpy("choose");
                var candidate1 = { response: { prompts: "prompt1" }, score: 10000 };
                var candidate2 = { response: { prompts: "prompt1" }, score: 10000 };
                var candidate3 = { response: { prompts: "prompt2" }, score: 10000 };
                responseLib.processResponses([candidate1, candidate2, candidate3]);
                expect(interact.choose).toHaveBeenCalledWith(["prompt1", "prompt2"], jasmine.any(Function));
            });
            it ("executes multiple responses with the same prompt when chosen", function () {
                interact.choose = jasmine.createSpy("choose");
                interact.say = jasmine.createSpy("say");
                var candidate1 = {response: {prompts: "prompt1", does: {common: {says: { text: "North" }}}}, score: 10000};
                var candidate2 = {response: {prompts: "prompt1", does: {common: {says: { text: "North2" }}}}, score: 10000};
                var candidate3 = {response: {prompts: "prompt2", does: {common: {says: { text: "South" }}}}, score: 10000};
                responseLib.processResponses([candidate1, candidate2, candidate3]);
                var callback = interact.choose.mostRecentCall.args[1];
                callback(0);
                expect(interact.say.callCount).toEqual(2);
                expect(interact.say.argsForCall[0]).toEqual([{ text: "North" }, candidate1.response]);
                expect(interact.say.argsForCall[1]).toEqual([{ text: "North2" }, candidate2.response]);
            });
        });
        describe("sets", function() {
            function spyOnSetState() {
                interact.setState = jasmine.createSpy("setState");
            }
            it("sets state for a single id with 'sets' attribute", function () {
                spyOnSetState();
                var response = { response: { does: { common: { sets: ["somestate"] } } }, score: 10000 };
                responseLib.processResponses([response]);
                expect(interact.setState).toHaveBeenCalledWith("somestate", true);
            });
            it("resets state for a single id with 'sets' attribute", function () {
                spyOnSetState();
                var response = { response: { does: { common: { sets: ["!somestate"] } } }, score: 10000 };
                responseLib.processResponses([response]);
                expect(interact.setState).toHaveBeenCalledWith("somestate", false);
            });
            it("sets state for multiple ids with 'sets' attribute", function () {
                spyOnSetState();
                var response = { response: { does: { common: { sets: ["somestate", "someotherstate"] } } }, score: 10000 };
                responseLib.processResponses([response]);
                expect(interact.setState.callCount).toEqual(2);
                expect(interact.setState.argsForCall[0]).toEqual(["somestate", true]);
                expect(interact.setState.argsForCall[1]).toEqual(["someotherstate", true]);
            });
            it("includes the responder in the attribute if passed", function () {
                spyOnSetState();
                var response = { response: { does: { common: { sets: ["somestate"] } } }, score: 10000, responder: "aresponder" };
                responseLib.processResponses([response]);
                expect(interact.setState).toHaveBeenCalledWith("aresponder.somestate", true);
            });
            it("includes the responder in the attribute if passed", function () {
                spyOnSetState();
                var response = { response: { does: { common: { sets: ["!somestate"] } } }, score: 10000, responder: "aresponder" };
                responseLib.processResponses([response]);
                expect(interact.setState).toHaveBeenCalledWith("aresponder.somestate", false);
            });
            it("treats attribute with period as absolute", function () {
                spyOnSetState();
                var response = { response: { does: { common: { sets: ["someone.somestate"] } } }, score: 10000, responder: "aresponder" };
                responseLib.processResponses([response]);
                expect(interact.setState).toHaveBeenCalledWith("someone.somestate", true);
            });
        });
    });
    describe("callTopics", function () {
        it("invokes responses correctly", function () {
            interact.say = jasmine.createSpy("say");
            var response1 = { matches: ["atopic"], does: { common: { says: { text: "This is response 1" } } } };
            var response2 = { matches: ["ctopic"], does: { common: { says: { text: "This is response 2" } } } };
            var response3 = { matches: ["btopic"], does: { common: { says: { text: "This is response 3" } } } };
            var responses = [response1, response2, response3];
            responseLib.callTopics({responder: responses}, ["ctopic"], "caller");
            expect(interact.say).toHaveBeenCalledWith({ text: "This is response 2" }, response2);
        });
    });
});
