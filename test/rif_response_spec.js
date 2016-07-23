define(['rif/response'], function(RifResponse) {
describe("RifResponse", function () {
    "use strict";
    var responseLib;
    var interact;
    var world;
    var story_text;
    beforeEach(function () {
        world = {
            getResponseRuns: function(id) {
                return 0;
            },
            setResponseRuns: function(id, runs) {
            }
        };
        story_text = { say: jasmine.createSpy("say") };
        responseLib = new RifResponse(world, story_text);
    });

    describe("callTopics", function () {
        it("invokes responses correctly", function () {
            var response1 = { matches: [{keyword: "atopic"}], does: { common: [ { says: { text: "This is response 1" } } ] } };
            var response2 = { matches: [{keyword: "ctopic"}], does: { common: [ { says: { text: "This is response 2" } } ] } };
            var response3 = { matches: [{keyword: "btopic"}], does: { common: [ { says: { text: "This is response 3" } } ] } };
            var responses = [response1, response2, response3];
            responseLib.callTopics({responder: responses}, [{keyword: "ctopic"}], "caller", {});
            expect(story_text.say).toHaveBeenCalledWith({ text: "This is response 2" }, 'responder');
        });
    });
});
});
