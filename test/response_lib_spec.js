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
        it("returns responses that match a topic", function () {
            var response1 = {a: 1, matches: ["atopic"]},
                response2 = {b: 2, matches: ["btopic"]},
                response3 = {c: 3, matches: ["atopic"]},
                responses = [response1, response2, response3],
                topics = ["atopic"],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: response1, score: 10000}, {response: response3, score: 10000}]);
        });
        xit("returns responses that match one of multiple topics", function () {
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
            var response1 = {a: 1, topics: ["*atopic"]},
                responses = [response1],
                topics = ["atopic"],
                candidates = responseLib.selectResponses(responses, topics);
            expect(candidates).toEqual([{response: response1, score: 10000}]);
        });
    });
});
