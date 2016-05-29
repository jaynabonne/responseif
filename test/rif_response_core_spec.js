define(['rif/response_core'], function(rifResponseCore) {
    "use strict";
    describe("computeScore", function () {
        var world;
        beforeEach(function() {
            world =  {
                getState: jasmine.createSpy('getState').andCallFake(function(id, responder) {
                    return parseFloat(id);
                })
            };
        });
        it("returns 1 if response topics is undefined", function () {
            expect(rifResponseCore.computeScore({}, [], 'responder', world)).toEqual(1);
        });
        it("returns 1 if response topics is empty", function () {
            var response_topics = [],
                topics = [],
                response = {matches: response_topics},
                score = rifResponseCore.computeScore(response, topics, 'responder', world);
            expect(score).toEqual(1);
        });
        it("returns 0 if response topic doesn't match any topics", function () {
            var response_topics = [{keyword:"atopic"}],
                topics = [{keyword:"btopic"}],
                score = rifResponseCore.computeScore({matches: response_topics}, topics, 'responder', world);
            expect(score).toEqual(0);
        });
        it("returns 1 if response topic matches any topic", function () {
            var response_topics = [{keyword:"atopic"}],
                topics = [{keyword:"atopic"}],
                score = rifResponseCore.computeScore({matches: response_topics}, topics, 'responder', world);
            expect(score).toEqual(1);
        });
        it("returns higher score for multiple matching topics", function() {
            var response_topics = [{keyword:"atopic"}, {keyword:"btopic"}],
                topics = [{keyword:"atopic"}, {keyword:"btopic"}, {keyword:"ctopic"}],
                score = rifResponseCore.computeScore({matches: response_topics}, topics, 'responder', world);
            expect(score).toEqual(2);
        });
        it("returns the right score for required topics", function () {
            var response_topics = [{keyword:"*atopic"}, {keyword:"btopic"}],
                topics = [{keyword:"atopic"}, {keyword:"btopic"}],
                score = rifResponseCore.computeScore({matches: response_topics}, topics, 'responder', world);
            expect(score).toEqual(2);
        });
        it("returns the right score for required called topics", function () {
            var response_topics = [{keyword:"atopic"}, {keyword:"btopic"}],
                topics = [{keyword:"*atopic"}, {keyword:"*btopic"}],
                score = rifResponseCore.computeScore({matches: response_topics}, topics, 'responder', world);
            expect(score).toEqual(2);
        });
        it("computes the score based on explicit weights", function () {
            var response_topics = [{keyword:"atopic", weight: 0.2}],
                topics = [{keyword:"atopic", weight: 0.9}],
                score = rifResponseCore.computeScore({matches: response_topics}, topics, 'responder', world);
            expect(score).toEqual(0.2*0.9);
        });
        it("computes the score correctly for a zero weight", function () {
            var response_topics = [{keyword:"atopic", weight: 0}],
                topics = [{keyword:"atopic", weight: 0.9}],
                score = rifResponseCore.computeScore({matches: response_topics}, topics, 'responder', world);
            expect(score).toEqual(0);
        });
        it("scales the score by the response weight", function () {
            var response_topics = [{keyword:"atopic", weight: 0.8}],
                topics = [{keyword:"atopic"}],
                score = rifResponseCore.computeScore({matches: response_topics, weights: "0.6"}, topics, 'responder', world);
            expect(score).toEqual(0.6*0.8);
        });
    });

    describe("responseIsEligible", function () {
        var world;
        beforeEach(function () {
            world = {
                runs: { },
                getResponseRuns : function(id) {
                    return this.runs[id] || 0;
                },
                setResponseRuns : function(id, runs) {
                    this.runs[id] = runs;
                },
                getState: jasmine.createSpy('getState').andCallFake(function(id, responder) {
                    return parseFloat(id);
                })
            };
        });

        it("returns true for a simple response", function () {
            expect(rifResponseCore.responseIsEligible({}, [], "aresponder", world)).toEqual(true);
        });
        it('gets its run count from the world if not yet set', function() {
            world.setResponseRuns(1, 3);
            var response = { id: 1 };
            rifResponseCore.responseIsEligible(response, [], "aresponder", world);
            expect(response.run).toBe(3);
        });
        it('does not get its run count from the world if already set', function() {
            world.setResponseRuns(1, 3);
            var response = { run: 5, id: 1 };
            rifResponseCore.responseIsEligible(response, [], "aresponder", world);
            expect(response.run).toBe(5);
        });
        it("returns false if the run equals or exceeds its occurs count", function () {
            var response = { run: 5, occurs: 5 };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(false);
        });
        it("returns false if required state is not set", function () {
            world.getState = function(id) { return false; };
            var response = { needs: ["somestate"] };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(false);
        });
        it("returns true if required state is set to a value", function () {
            world.getState = function(id) { return "something"; };
            var response = { needs: ["somestate"] };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(true);
        });
        it("returns false if required state is less than 0.5", function () {
            world.getState = function(id) { return 0.4; };
            var response = { needs: ["somestate"] };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(false);
        });
        it("returns false if disallowed state is set", function () {
            world.getState = function(id) { return true; };
            var response = { needs: ["!somestate"] };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(true);
        });
        it("returns correct value for multiple states", function () {
            world.getState = function(id) { return true; };
            var response = { needs: ["somestate", "!someotherstate"] };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(true);
        });
        it("returns false if required topics are not present", function () {
            var response = { matches: [{keyword: "*atopic"}] };
            expect(rifResponseCore.responseIsEligible(response, [{keyword: "btopics"}], 'aresponder', world)).toEqual(false);
        });
        it("returns false if topics score is not positive", function () {
            var response = { matches: [{keyword: "atopic"}] };
            expect(rifResponseCore.responseIsEligible(response, [{keyword: "btopics"}], 'aresponder', world)).toEqual(false);
        });
        it("passes the responder as state prefix if passed", function () {
            world.getState = function(id, responder) { return id === "somestate" && responder === "aresponder"; };
            var response = { needs: ["somestate"] };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(true);
        });
        it("passes the responder as state prefix if passed (negative)", function () {
            world.getState = function(id, responder) { return id === "!somestate" && responder === "aresponder"; };
            var response = { needs: ["!somestate"] };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(true);
        });
        it('properly works with response weights', function() {
            var response = { weights: '0.5' };
            expect(rifResponseCore.responseIsEligible(response, [], "aresponder", world)).toEqual(true);
        });
    });
    describe("selectResponses", function () {
        var world;
        beforeEach(function() {
            world =  {
                getResponseRuns: function(id) {
                    return 0;
                }
            };
        });
        it("returns an empty list for no input", function () {
            var candidates = rifResponseCore.selectResponses([], [], "", world);
            expect(candidates).toEqual([]);
        });
        it("returns all simple responses with score 1", function () {
            var responses = [{a: 1}, {b: 2}, {c: 3}];
            var topics = [];
            var candidates = rifResponseCore.selectResponses(responses, topics, "responder", world);
            expect(candidates).toEqual([
                {response: {a: 1, run: 0}, score: 1, responder: "responder"},
                {response: {b: 2, run: 0}, score: 1, responder: "responder"},
                {response: {c: 3, run: 0}, score: 1, responder: "responder"}
            ]);
        });
        it("returns the responder in the responses if passed", function () {
            var response = {a: 1};
            var responder = { a: 314 };
            var candidates = rifResponseCore.selectResponses([response], [], responder, world);
            expect(candidates).toEqual([{response: response, score: 1, responder: responder}]);
        });

        it("returns responses that match a topic", function () {
            var response1 = {a: 1, matches: [{keyword: "atopic"}]},
                response2 = {b: 2, matches: [{keyword: "btopic"}]},
                response3 = {c: 3, matches: [{keyword: "atopic"}]},
                responses = [response1, response2, response3],
                topics = [{keyword: "atopic"}],
                candidates = rifResponseCore.selectResponses(responses, topics, "responder", world);
            expect(candidates).toEqual([{response: response1, score: 1, responder: "responder"}, {response: response3, score: 1, responder: "responder"}]);
        });
        it("returns responses that match one of multiple topics", function () {
            var response1 = {a: 1, matches: [{keyword: "atopic"}]},
                response2 = {b: 2, matches: [{keyword: "btopic"}]},
                response3 = {c: 3, matches: [{keyword: "atopic"}]},
                response4 = {d: 4, matches: [{keyword: "ctopic"}]},
                responses = [response1, response2, response3, response4],
                topics = [{keyword: "btopic"}, {keyword: "ctopic"}],
                candidates = rifResponseCore.selectResponses(responses, topics, "responder", world);
            expect(candidates).toEqual([{response: response2, score: 1, responder: "responder"}, {response: response4, score: 1, responder: "responder"}]);
        });
        it("returns a higher score for more matched topics", function () {
            var response1 = {a: 1, matches: [{keyword: "atopic"}, {keyword: "btopic"}]},
                response2 = {b: 2, matches: [{keyword: "btopic"}]},
                responses = [response1, response2],
                topics = [{keyword: "atopic"}, {keyword: "btopic"}],
                candidates = rifResponseCore.selectResponses(responses, topics, "responder", world);
            expect(candidates).toEqual([{response: response1, score: 2, responder: "responder"}, {response: response2, score: 1, responder: "responder"}]);
        });
        it("returns responses whose count does not exceed maxcount", function () {
            var response1 = {a: 1, occurs: 10},
                response2 = {b: 2, run: 4, occurs: 4 },
                response3 = {c: 3},
                response4 = {d: 4, run: 5 },
                responses = [response1, response2, response3, response4],
                topics = [],
                candidates = rifResponseCore.selectResponses(responses, topics, "responder", world);
            expect(candidates).toEqual([{response: response1, score: 1, responder: "responder"}, {response: response3, score: 1, responder: "responder"}, {response: response4, score: 1, responder: "responder"}]);
        });
        it("returns the right score for a required topic", function () {
            var response1 = {a: 1, matches: [{keyword: "*atopic"}]},
                responses = [response1],
                topics = [{keyword: "atopic"}],
                candidates = rifResponseCore.selectResponses(responses, topics, "responder", world);
            expect(candidates).toEqual([{response: response1, score: 1, responder: "responder"}]);
        });
        it("returns eligible child responses", function () {
            var response1 = {a: 1, matches: [{keyword: "atopic"}]},
                response2 = {b: 2, matches: [{keyword: "btopic"}]},
                response3 = {c: 3},
                response4 = {d: 4, run: 4, occurs: 4 },
                parentresponse = { selects: [response1, response2, response3, response4] },
                responses = [parentresponse],
                topics = [{keyword: "atopic"}],
                candidates = rifResponseCore.selectResponses(responses, topics, "responder", world);
            expect(candidates).toEqual([{response: response1, score: 1, responder: "responder"}, {response: response3, score: 1, responder: "responder"}]);
        });
        it("does not return eligible child responses if the parent is ineligible", function () {
            var response1 = {a: 1},
                parentresponse = { matches:[{keyword: "*atopic"}], selects: [response1] },
                responses = [parentresponse],
                topics = [],
                candidates = rifResponseCore.selectResponses(responses, topics, "responder", world);
            expect(candidates).toEqual([]);
        });
    });
    describe('groupCandidates', function() {
        it('should return no groups or prompts by default', function() {
            var candidate_groups = rifResponseCore.groupCandidates([]);
            expect(candidate_groups.groups).toEqual({});
            expect(candidate_groups.prompts).toEqual([]);
        });
        it('should return responses sorted by groups', function() {
            var candidate1 = { response: { is: 'typeA'}};
            var candidate2 = { response: { is: 'typeB'}};
            var candidate_groups = rifResponseCore.groupCandidates([candidate1, candidate2]);
            expect(candidate_groups.groups).toEqual({ typeA: [candidate1], typeB: [candidate2]});
            expect(candidate_groups.prompts).toEqual([]);
        });
        it('should use group "general" if none specified', function() {
            var candidate1 = { response: { is: 'typeA'}};
            var candidate2 = { response: { }};
            var candidate_groups = rifResponseCore.groupCandidates([candidate1, candidate2]);
            expect(candidate_groups.groups).toEqual({ typeA: [candidate1], general: [candidate2]});
            expect(candidate_groups.prompts).toEqual([]);
        });
        it('should group candidates with prompts into prompts list', function() {
            var candidate1 = { response: { is: 'typeA'}};
            var candidate2 = { response: { is: 'typeB', prompts: 'a prompt'}};
            var candidate_groups = rifResponseCore.groupCandidates([candidate1, candidate2]);
            expect(candidate_groups.groups).toEqual({ typeA: [candidate1] });
            expect(candidate_groups.prompts).toEqual([candidate2]);
        });
    });

});
