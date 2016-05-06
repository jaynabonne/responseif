define(['rif/priority_response_getter'], function(RifPriorityResponseGetter) {
    "use strict";

    describe("priority response getter", function () {
        it("returns an empty list for no input", function () {
            var responses = RifPriorityResponseGetter.getPriorityResponses([]);
            expect(responses).toEqual([]);
        });
        it("returns a single entry", function () {
            var response1 = {a: 1, score: 10000};
            var responses = RifPriorityResponseGetter.getPriorityResponses([response1]);
            expect(responses).toEqual([response1]);
        });
        it("returns the entry with the higher score for two entries", function () {
            var response1 = {a: 1, score: 10000};
            var response2 = {a: 2, score: 20000};
            var responses = RifPriorityResponseGetter.getPriorityResponses([response1, response2]);
            expect(responses).toEqual([response2]);
        });
        it("returns all the entries with the highest score", function () {
            var response1 = {a: 1, score: 10000};
            var response2 = {a: 2, score: 20000};
            var response3 = {a: 3, score: 20000};
            var response4 = {a: 4, score: 15000};
            var responses = RifPriorityResponseGetter.getPriorityResponses([response1, response2, response3, response4]);
            expect(responses).toEqual([response2, response3]);
        });
    });
});