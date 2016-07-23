define(['rif/response'], function(RifResponse) {
describe("RifResponse", function () {
    "use strict";
    var responseLib;
    var interact;
    var world;
    beforeEach(function () {
        world = {
            getResponseRuns: function(id) {
                return 0;
            },
            setResponseRuns: function(id, runs) {
            }
        };
        responseLib = new RifResponse(world);
    });

    describe("callTopics", function () {
        it("invokes responses correctly", function () {
            var story_text = { say: jasmine.createSpy("say") };
            var response1 = { matches: [{keyword: "atopic"}], does: { common: [ { says: { text: "This is response 1" } } ] } };
            var response2 = { matches: [{keyword: "ctopic"}], does: { common: [ { says: { text: "This is response 2" } } ] } };
            var response3 = { matches: [{keyword: "btopic"}], does: { common: [ { says: { text: "This is response 3" } } ] } };
            var responses = [response1, response2, response3];
            responseLib.callTopics({responder: responses}, [{keyword: "ctopic"}], "caller", {}, story_text);
            expect(story_text.say).toHaveBeenCalledWith({ text: "This is response 2" }, 'responder');
        });
    });
});
});
