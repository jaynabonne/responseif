define(['rif/interact'], function(RifInteract) {
describe("RifInteract", function () {
    var interact;
    var world;
    var rif;
    var response_lib;
    var story_text;

    beforeEach(function () {
        world = {
            getState: jasmine.createSpy("getState"),
            setState: jasmine.createSpy("setState"),
            setParent: jasmine.createSpy("setParent"),
            getCurrentResponders : function() {
                return [];
            },
            getPOV: function() {
                return "player";
            },
            getCurrentTopics: function(caller) {
                return [];
            },
            updateModels: jasmine.createSpy('updateModels')
        };
        rif = {};
        response_lib = {
            callTopics: jasmine.createSpy('callTopics')
        };
        story_text = {
            hideSections: jasmine.createSpy('hideSections'),
            beforeCommand: jasmine.createSpy('beforeCommand'),
            afterCommand: jasmine.createSpy('afterCommand'),
            removeDeadLinks: jasmine.createSpy('removeDeadLinks')
        };
        interact = new RifInteract(world, response_lib, rif, story_text);
    });
    describe("call", function () {
        it("should call the passed topics", function () {
            interact.call([{keyword: "topicA", weight: 1.0}, {keyword: "topicB", weight: 1.0}, {keyword: "topicC", weight: 1.0}]);
            expect(response_lib.callTopics).toHaveBeenCalledWith({}, [{keyword:"topicA", weight: 1.0}, {keyword:"topicB", weight: 1.0}, {keyword:"topicC", weight: 1.0}], "player", interact);
        });
        it("should include the current actor topics", function () {
            world.getCurrentTopics = function(caller) {
                return (caller === 'player') ? [{keyword: 'topicD', weight: 1.0}] : [];
            };
            interact.call([{keyword: "topicA", weight: 1.0}, {keyword: "topicB", weight: 1.0}, {keyword: "topicC", weight: 1.0}]);
            expect(response_lib.callTopics).toHaveBeenCalledWith({}, [{keyword:"topicA", weight: 1.0}, {keyword:"topicB", weight: 1.0}, {keyword:"topicC", weight: 1.0}, {keyword:"topicD", weight: 1.0}], "player", interact);
        });
    });
    describe("callActions", function () {
        it("should call the passed topics", function () {
            rif.actions = {actor: "responses"};
            interact.callActions("topicA topicB topicC");
            expect(response_lib.callTopics).toHaveBeenCalledWith({actor: "responses"}, [{keyword: "topicA", weight: 1.0}, {keyword: "topicB", weight: 1.0}, {keyword: "topicC", weight: 1.0}], "actor", interact);
        });
        it("should include the current actor topics", function () {
            world.getCurrentTopics = function (caller) {
                return (caller === 'actor') ? [{keyword: 'topicD', weight: 1.0}] : [];
            };
            rif.actions = {actor: "responses"};
            interact.callActions("ACT");
            expect(response_lib.callTopics).toHaveBeenCalledWith({actor: "responses"}, [{keyword: "ACT", weight: 1.0}, {keyword: "topicD", weight: 1.0}], "actor", interact);
        });
    });
    describe("invoke", function () {
        it("should invoke the function", function() {
            world.api = jasmine.createSpy('api');
            interact.other_api = jasmine.createSpy('other_api');
            story_text.some_api = jasmine.createSpy('other_api');

            interact.invoke('world.api(responder); story_text.some_api("param"); interact.other_api();', 'aresponder');

            expect(world.api).toHaveBeenCalledWith('aresponder');
            expect(interact.other_api).toHaveBeenCalledWith();
            expect(story_text.some_api).toHaveBeenCalledWith('param');
        });
    });
    describe("sendCommand", function() {
        it("should invoke the response library's callTopics", function () {
            interact.sendCommand(["topicA", "topicB"]);
            expect(response_lib.callTopics).toHaveBeenCalled();
        });
        it("should invoke idle processing", function () {
            interact.idleProcessing = jasmine.createSpy("idleProcessing");
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(interact.idleProcessing).toHaveBeenCalledWith();
        });
        it('should update the world models', function() {
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(world.updateModels).toHaveBeenCalled();
        });
    });
    describe('runSetups', function() {
        it('should run the setup responses', function() {
            var response = {
                id: 0,
                does: {
                    common: [{says: {text: "Hello world!"}}]
                }
            };
            rif.setup = [
                {
                    responder: 'aresponder',
                    responses: [ response ]
                }
            ];
            interact.runSetups();
            expect(response_lib.callTopics).toHaveBeenCalledWith({aresponder: [response]}, [], '', interact);
        });
    });
});

});
