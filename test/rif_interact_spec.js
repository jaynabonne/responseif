define(['rif/interact'], function(RifInteract) {
describe("RifInteract", function () {
    var output;
    var interact;
    var appendSpy;
    var world;
    var rif;
    var dom;
    var response_lib;
    var story_text;
    var output_context;

    beforeEach(function () {
        appendSpy = jasmine.createSpy("div append");
        dom = {
            createDiv: jasmine.createSpy("getElementBySelector"),
            scrollToEnd: function() {},
            append: function(div) {},
            getElementBySelector: jasmine.createSpy("getElementBySelector"),
            removeElement: jasmine.createSpy("removeElement"),
            showElement: jasmine.createSpy("showElement"),
            removeClass: jasmine.createSpy('removeClass'),
            removeEvent: jasmine.createSpy('removeEvent'),
            clear: jasmine.createSpy('clear'),
            setText: jasmine.createSpy('setText'),
            appendText: jasmine.createSpy('appendText')
        };
        dom.createDiv.andReturn({ append: appendSpy});
        output_context = jasmine.createSpyObj(
                'output context',
                [
                    'begin',
                    'append',
                    'end',
                    'getOutputText',
                    'addMenuCallback'
                ]);
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
            callTopics: jasmine.createSpy('callTopics'),
            getCandidateResponses: jasmine.createSpy('getCandidateResponses')
        };
        story_text = {
            hideSections: jasmine.createSpy('hideSections'),
            beforeCommand: jasmine.createSpy('hideSections'),
            filterLinks: jasmine.createSpy('filterLinks'),
            say: jasmine.createSpy('say'),
            push_context: function() {
                return output_context;
            },
            pop_context: jasmine.createSpy('pop_context')
        };
        interact = new RifInteract(dom, world, response_lib, rif, story_text);
        appendSpy.reset();
    });
    describe("call", function () {
        it("should call the passed topics", function () {
            interact.call([{keyword: "topicA", weight: 1.0}, {keyword: "topicB", weight: 1.0}, {keyword: "topicC", weight: 1.0}]);
            expect(response_lib.callTopics).toHaveBeenCalledWith({}, [{keyword:"topicA", weight: 1.0}, {keyword:"topicB", weight: 1.0}, {keyword:"topicC", weight: 1.0}], "player", interact, story_text);
        });
        it("should include the current actor topics", function () {
            world.getCurrentTopics = function(caller) {
                return (caller === 'player') ? [{keyword: 'topicD', weight: 1.0}] : [];
            };
            interact.call([{keyword: "topicA", weight: 1.0}, {keyword: "topicB", weight: 1.0}, {keyword: "topicC", weight: 1.0}]);
            expect(response_lib.callTopics).toHaveBeenCalledWith({}, [{keyword:"topicA", weight: 1.0}, {keyword:"topicB", weight: 1.0}, {keyword:"topicC", weight: 1.0}, {keyword:"topicD", weight: 1.0}], "player", interact, story_text);
        });
    });
    describe("callActions", function () {
        it("should call the passed topics", function () {
            rif.actions = {actor: "responses"};
            interact.callActions(["topicA", "topicB", "topicC"]);
            expect(response_lib.callTopics).toHaveBeenCalledWith({actor: "responses"}, [{keyword: "topicA", weight: 1.0}, {keyword: "topicB", weight: 1.0}, {keyword: "topicC", weight: 1.0}], "actor", interact, story_text);
        });
        it("should include the current actor topics", function () {
            world.getCurrentTopics = function (caller) {
                return (caller === 'actor') ? [{keyword: 'topicD', weight: 1.0}] : [];
            };
            rif.actions = {actor: "responses"};
            interact.callActions(["ACT"]);
            expect(response_lib.callTopics).toHaveBeenCalledWith({actor: "responses"}, [{keyword: "ACT", weight: 1.0}, {keyword: "topicD", weight: 1.0}], "actor", interact, story_text);
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
        it('should hide any auto-hide text', function() {
            interact.sendCommand(["topicA", "topicB", "topicC"]);
            expect(story_text.hideSections).toHaveBeenCalled();
        })
    });
    describe("expandResponseReferences", function() {
        it('should return the same responses if no references exist', function() {
            var responses = [
                {
                    id: "A"
                },
                {
                    id: "B"
                }
            ];

            expect(interact.expandResponseReferences(responses)).toEqual(responses);
        });
        it('should return reference responses', function() {
            rif.responses = {referred: [{id: "C"}, {id: "D"}]};
            var responses = [
                {
                    id: "A"
                },
                {
                    reference: "referred"
                },
                {
                    id: "B"
                }
            ];

            var expected = [
                {
                    id: "A"
                },
                {
                    id: "C"
                },
                {
                    id: "D"
                },
                {
                    id: "B"
                }
            ];
            expect(interact.expandResponseReferences(responses)).toEqual(expected);
        });
    });
    describe('hiding obsolete links', function() {
        it('should remove a link after the next command', function() {
            var links = [{selector: '.link1', keywords: 'Keyword1'}];
            story_text.filterLinks.andCallFake(function(f) {
                f(links[0]);
            });
            response_lib.getCandidateResponses = function(responders, topics) {
                return [];
            };

            expect(dom.removeClass).not.toHaveBeenCalledWith('.link1', 'keyword');

            interact.sendCommand([{keyword: "topicA"}]);
            expect(dom.removeClass).toHaveBeenCalledWith('.link1', 'keyword');
            expect(dom.removeEvent).toHaveBeenCalledWith('.link1', 'click');
        });
        it('should remove multiple links after the next command', function() {
            var links = [{selector: '.link1', keywords: 'Keyword1'},{selector: '.link2', keywords: 'Keyword2'}];
            story_text.filterLinks.andCallFake(function(f) {
                f(links[0]);
                f(links[1]);
            });
            response_lib.getCandidateResponses = function(responders, topics) {
                return [];
            };

            interact.sendCommand([{keyword: "topicA"}]);
            expect(dom.removeClass).toHaveBeenCalledWith('.link1', 'keyword');
            expect(dom.removeEvent).toHaveBeenCalledWith('.link1', 'click');
            expect(dom.removeClass).toHaveBeenCalledWith('.link2', 'keyword');
            expect(dom.removeEvent).toHaveBeenCalledWith('.link2', 'click');
        });
        it('should not remove a link if topics still have a response', function() {
            var links = [{selector: '.link1', keywords: 'Keyword1'}];
            story_text.filterLinks.andCallFake(function(f) {
                f(links[0]);
            });
            world.getCurrentResponders = function() {
                return ['responder'];
            };

            response_lib.getCandidateResponses = function(responders, topics) {
                if (topics[0].keyword === 'Keyword1')
                    return [{response: {}, score: '10000', responder: 'responder'}];
                return [];
            };

            interact.sendCommand([{keyword: "topicA"}]);
            expect(dom.removeClass).not.toHaveBeenCalledWith('.link1', 'keyword');
            expect(dom.removeEvent).not.toHaveBeenCalledWith('.link1', 'click');
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
            expect(response_lib.callTopics).toHaveBeenCalledWith({aresponder: [response]}, [], '', interact, story_text);
        });
    });
});

});
