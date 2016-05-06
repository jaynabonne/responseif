define(['rif/response'], function(RifResponse) {
describe("RifResponse", function () {
    "use strict";
    var responseLib;
    var interact;
    var world;
    beforeEach(function () {
        interact = {};
        world = {
            getResponseRuns: function(id) {
                return 0;
            },
            setResponseRuns: function(id, runs) {
            }
        };
        responseLib = new RifResponse(world);
    });

    describe("processResponses", function () {
        describe("general", function () {
            it("increments the response run count by one", function () {
                var candidate = { response: { }, score: 1 };
                var candidates = [candidate];
                responseLib.processResponses(candidates, "", [], interact);
                expect(candidate.response.run).toBe(1);
                responseLib.processResponses(candidates, "", [], interact);
                expect(candidate.response.run).toBe(2);
            });
            it("groups responses by type", function () {
                var output = "";
                interact.say = function(says) { output += says.text; };
                responseLib.setTypes(["a","b","c"]);
                var responses = [
                    { response: { is:"c", does: { common: [ {says: { text: "C!"} } ] } }, score: 1 },
                    { response: { is:"b", does: { common: [ {says: { text: "B!"} } ] } }, score: 1 },
                    { response: { is:"a", does: { common: [ {says: { text:  "A!"} } ] } }, score: 1 },
                    { response: { is:"b", does: {common: [ {says: { text:  "B again!"} } ] } }, score: 1 }
                ];
                responseLib.processResponses(responses, "", [], interact);
                expect(output).toEqual("A!B!B again!C!");
            });
            it("orders responses", function () {
                var output = "";
                interact.say = function(says) { output += says.text; };
                responseLib.setTypes(["a","b","c"]);
                var responses = [
                    { response: { orders:99, does: { common: [ {says: { text: "C!"} } ] } }, score: 1 },
                    { response: { does: { common: [ {says: { text: "B!"} } ] } }, score: 1 },
                    { response: { orders:10, does: { common: [ {says: { text:  "A!"} } ] } }, score: 1 },
                    { response: { does: {common: [ {says: { text:  "B again!"} } ] } }, score: 1 }
                ];
                responseLib.processResponses(responses, "", [], interact);
                expect(output).toEqual("B!B again!A!C!");
            });
        });
        describe("prompts", function () {
            it("shows prompts in a menu", function () {
                interact.choose = jasmine.createSpy("choose");
                var candidate1 = {response: {prompts: "Go north"}, score: 1};
                var candidate2 = {response: {prompts: "Go south"}, score: 1};
                responseLib.processResponses([candidate1, candidate2], "", [], interact);
                expect(interact.choose).toHaveBeenCalledWith(["Go north", "Go south"], jasmine.any(Function));
            });
            it("processes a single prompt as a normal response if forcesprompt is false", function () {
                interact.say = jasmine.createSpy("say");
                interact.choose = jasmine.createSpy("choose");
                var candidate1 = { response: { prompts: "Go north", forcesprompt: false, does: { common: [ { says: { text: "something" } } ] } }, score: 1 };
                responseLib.processResponses([candidate1], "", [], interact);
                expect(interact.choose).not.toHaveBeenCalled();
                expect(interact.say).toHaveBeenCalled();
            });
            it("processes a single prompt as a prompt if 'forcesprompt' is not set", function () {
                interact.choose = jasmine.createSpy("choose");
                var candidate1 = { response: { prompts: "Go north"}, score: 1 };
                responseLib.processResponses([candidate1], "", [], interact);
                expect(interact.choose).toHaveBeenCalledWith(["Go north"], jasmine.any(Function));
            });
            it("passes a callback function to be invoked when an item is chosen", function () {
                interact.choose = jasmine.createSpy("choose");
                interact.say = jasmine.createSpy("say");
                var candidate1 = { response: { prompts: "Go north", does: { common: [ { says: { text: "North" } } ] } }, score: 1, responder: 'responder' };
                var candidate2 = { response: { prompts: "Go south", does: { common: [ { says: { text: "South" } } ] }  }, score: 1, responder: 'responder' };
                responseLib.processResponses([candidate1, candidate2], "", [], interact);
                var callback = interact.choose.mostRecentCall.args[1];
                callback(1);
                expect(interact.say).toHaveBeenCalledWith({text: "South"}, 'responder');
            });
            it("does nothing if the menu callback is called with -1", function () {
                interact.choose = jasmine.createSpy("choose");
                interact.say = jasmine.createSpy("say");
                var candidate1 = { response: { prompts: "Go north", does: { common: [ { says: { text: "North" } } ] } }, score: 1 };
                var candidate2 = { response: { prompts: "Go south", does: { common: [ { says: { text: "South" } } ] }  }, score: 1 };
                responseLib.processResponses([candidate1, candidate2], "", [], interact);
                var callback = interact.choose.mostRecentCall.args[1];
                callback(-1);
                expect(interact.say).not.toHaveBeenCalled();
            });
            it ("combines multiple responses with the same prompt under one menu choice", function () {
                interact.choose = jasmine.createSpy("choose");
                var candidate1 = { response: { prompts: "prompt1" }, score: 1 };
                var candidate2 = { response: { prompts: "prompt1" }, score: 1 };
                var candidate3 = { response: { prompts: "prompt2" }, score: 1 };
                responseLib.processResponses([candidate1, candidate2, candidate3], "", [], interact);
                expect(interact.choose).toHaveBeenCalledWith(["prompt1", "prompt2"], jasmine.any(Function));
            });
            it ("executes multiple responses with the same prompt when chosen", function () {
                interact.choose = jasmine.createSpy("choose");
                interact.say = jasmine.createSpy("say");
                var candidate1 = {response: {prompts: "prompt1", does: {common: [ {says: { text: "North" } } ] } }, score: 1, responder: 'responder'};
                var candidate2 = {response: {prompts: "prompt1", does: {common: [ {says: { text: "North2" } } ] } }, score: 1, responder: 'responder'};
                var candidate3 = {response: {prompts: "prompt2", does: {common: [ {says: { text: "South" } } ] } }, score: 1, responder: 'responder'};
                responseLib.processResponses([candidate1, candidate2, candidate3], "", [], interact);
                var callback = interact.choose.mostRecentCall.args[1];
                callback(0);
                expect(interact.say.callCount).toEqual(2);
                expect(interact.say.argsForCall[0]).toEqual([{ text: "North" }, 'responder']);
                expect(interact.say.argsForCall[1]).toEqual([{ text: "North2" }, 'responder']);
            });
        });
    });
    describe("callTopics", function () {
        it("invokes responses correctly", function () {
            interact.say = jasmine.createSpy("say");
            var response1 = { matches: [{keyword: "atopic"}], does: { common: [ { says: { text: "This is response 1" } } ] } };
            var response2 = { matches: [{keyword: "ctopic"}], does: { common: [ { says: { text: "This is response 2" } } ] } };
            var response3 = { matches: [{keyword: "btopic"}], does: { common: [ { says: { text: "This is response 3" } } ] } };
            var responses = [response1, response2, response3];
            responseLib.callTopics({responder: responses}, [{keyword: "ctopic"}], "caller", interact);
            expect(interact.say).toHaveBeenCalledWith({ text: "This is response 2" }, 'responder');
        });
    });
});
});
