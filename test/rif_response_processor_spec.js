define(['rif/response_processor'], function(RifResponseProcessor) {
    var interact;
    var world;
    var processor;
    beforeEach(function() {
        interact  = {};
        world = {
            getResponseRuns: function(id) {
                return 0;
            },
            setResponseRuns: jasmine.createSpy('setResponseRuns'),
            addTopics: jasmine.createSpy('addTopics')
        };
        processor = new RifResponseProcessor('caller', interact, [], world);
    });
    describe('run count management', function() {
        it('loads the run count if not yet set', function() {
            world.getResponseRuns = function(id) {
                return 3;
            };
            var response = {id:1};
            processor.processResponse(response, 'responder');
            expect(response.run).toBe(4);
        });
        it('increments and saves the run count each time it is run', function() {
            var response = {id:101};

            processor.processResponse(response, 'responder');
            expect(response.run).toBe(1);
            expect(world.setResponseRuns).toHaveBeenCalledWith(101, 1);

            processor.processResponse(response, 'responder');
            expect(response.run).toBe(2);
            expect(world.setResponseRuns).toHaveBeenCalledWith(101, 2);

            processor.processResponse(response, 'responder');
            expect(response.run).toBe(3);
            expect(world.setResponseRuns).toHaveBeenCalledWith(101, 3);

        });
    });
    describe("says", function () {
        beforeEach(function() {
            interact.say = jasmine.createSpy("say");
        });
        it("text for a matching response", function () {
            var response = {
                does: {common: [{says: {text: "Hello world!"}}]}
            };
            processor.processResponse(response, 'responder');
            expect(interact.say).toHaveBeenCalledWith({text: "Hello world!"}, "responder");
        });
        it("no text for no matching responses", function() {
            processor.processResponse([], 'responder');
            expect(interact.say).not.toHaveBeenCalled();
        });
        it("text for all matching responses", function() {
            var response1 = { does: { common: [ {says: { text: "Hello world!"} } ] } };
            var response2 = { does: { common: [ {says: { text: "Goodnight moon!"} } ] } };
            processor.processResponse(response1, 'responder');
            processor.processResponse(response2, 'responder');
            expect(interact.say.callCount).toEqual(2);
            expect(interact.say.argsForCall[0]).toEqual([{ text: "Hello world!" }, 'responder']);
            expect(interact.say.argsForCall[1]).toEqual([{ text: "Goodnight moon!" }, 'responder']);
        });
        it("text only for matching responses that have text", function() {
            var response1 = { };
            var response2 = { does: { common: [ {says: { text: "See ya later!"} } ] } };
            processor.processResponse(response1, 'responder');
            processor.processResponse(response2, 'responder');
            expect(interact.say.callCount).toEqual(1);
            expect(interact.say.argsForCall[0]).toEqual([{ text: "See ya later!" }, 'responder']);
        });
        it("text in proper sequence", function() {
            var response = {
                does: {
                    common: [ {says: { text: "See ya later!"} } ],
                    1: [ {says: { text: "Hello world!"} } ],
                    3: [ {says: { text: "I'm going"} } ]
                }
            };
            processor.processResponse(response, 'responder');
            processor.processResponse(response, 'responder');
            processor.processResponse(response, 'responder');
            processor.processResponse(response, 'responder');
            expect(interact.say.argsForCall).toEqual([
                [{ text: "Hello world!"}, 'responder'],
                [{ text: "See ya later!"}, 'responder'],
                [{ text: "I'm going"}, 'responder'],
                [{ text: "See ya later!"}, 'responder']
            ]);
        });
    });
    describe("sets", function() {
        beforeEach(function() {
            world.setState = jasmine.createSpy("setState");
        });
        it("sets state for a single id with 'sets' attribute", function () {
            var response = { does: { common: [ { sets: {expression:"somestate" } } ] } };
            processor.processResponse(response);
            expect(world.setState).toHaveBeenCalledWith({expression:"somestate"}, "");
        });
        it("includes the responder if passed", function () {
            var response = { does: { common: [ { sets: {expression: ":somestate"} } ] } };
            processor.processResponse(response, 'aresponder');
            expect(world.setState).toHaveBeenCalledWith({expression: ":somestate"}, "aresponder");
        });
    });
    describe("uses all", function() {
        it("processes all the eligible child responses", function() {
            interact.say = jasmine.createSpy("say");
            world.getState = function(id) { return  false;};
            var response1 = { does: { common: [ { says: {text: "Text 1"} } ] } };
            var response2 = { needs: "somestate", does: { common: [ { says: {text: "Text 2"} } ] } };
            var response3 = { does: { common: [ { says: {text: "Text 3"} } ] } };
            var response = {
                does: {
                    common: [ {
                        uses: {
                            all: [
                                response1,
                                response2,
                                response3
                            ]
                        }
                    } ]
                }
            };
            processor.processResponse(response, 'responder');
            expect(interact.say.callCount).toEqual(2);
            expect(interact.say.argsForCall[0]).toEqual([{ text: "Text 1" }, 'responder']);
            expect(interact.say.argsForCall[1]).toEqual([{ text: "Text 3" }, 'responder']);
        });
    });
    describe("uses first", function() {
        it("processes up to the first eligible child responses", function() {
            interact.say = jasmine.createSpy("say");
            world.getState = function(id) { return  false;};
            var response1 = { needs: "somestate", does: { common: [ { says: {text: "Text 1"} } ] } };
            var response2 = { does: { common: [ { says: {text: "Text 2"} } ] } };
            var response3 = { does: { common: [ { says: {text: "Text 3"} } ] } };
            var response = {
                does: {
                    common: [ {
                        uses: {
                            first: [
                                response1,
                                response2,
                                response3
                            ]
                        }
                    } ]
                }
            };
            processor.processResponse(response, 'responder');
            expect(interact.say.callCount).toEqual(1);
            expect(interact.say.argsForCall[0]).toEqual([{ text: "Text 2" }, 'responder']);
        });
        it('uses topics to determine child eligibility', function() {
            processor = new RifResponseProcessor('caller', interact, [{keyword: 'bar'}], world);
            interact.say = jasmine.createSpy("say");
            world.getState = function(id) { return  false;};
            var response1 = { matches: [{keyword:'foo'}], does: { common: [ { says: {text: "Text 1"} } ] } };
            var response2 = { matches: [{keyword: 'bar'}], does: { common: [ { says: {text: "Text 2"} } ] } };
            var response3 = { does: { common: [ { says: {text: "Text 3"} } ] } };
            var response = {
                does: {
                    common: [ {
                        uses: {
                            first: [
                                response1,
                                response2,
                                response3
                            ]
                        }
                    } ]
                }
            };
            processor.processResponse(response, 'responder');
            expect(interact.say.callCount).toEqual(1);
            expect(interact.say.argsForCall[0]).toEqual([{ text: "Text 2" }, 'responder']);
        });
    });
    describe("uses random", function() {
        var response1, response2, response3;

        function getResponseForResponses(responses) {
            return {
                does: {
                    common: [{
                        uses: {
                            random: responses
                        }
                    }]
                }
            };
        }

        beforeEach(function() {
            response1 = { needs: ["cond1"], does: { common: [ { says: {text: "Text 1"} } ] } };
            response2 = { needs: ["cond2"], does: { common: [ { says: {text: "Text 2"} } ] } };
            response3 = { needs: ["cond3"], does: { common: [ { says: {text: "Text 3"} } ] } };
            world.getRandomInRange = jasmine.createSpy('getRandomInRange').andReturn(0);
            world.getState = function(id) { return true;};
        });
        it("processes a single response", function() {
            var response = getResponseForResponses([ response1 ]);
            interact.say = jasmine.createSpy("say");
            processor.processResponse(response, 'responder');
            expect(interact.say.callCount).toEqual(1);
            expect(interact.say.argsForCall[0]).toEqual([{ text: "Text 1" }, 'responder']);
        });
        it("does not process an ineligible response", function() {
            world.getState = function(id) { return false;};

            var response = getResponseForResponses([ response1 ]);
            interact.say = jasmine.createSpy("say");
            processor.processResponse(response, 'responder');
            expect(interact.say.callCount).toEqual(0);
        });
        it("returns a randomly selected response", function() {
            var response = getResponseForResponses([ response1, response2 ]);
            interact.say = jasmine.createSpy("say");

            world.getRandomInRange.andReturn(0);

            processor.processResponse(response, 'responder');
            expect(world.getRandomInRange).toHaveBeenCalledWith(0, 1);

            expect(interact.say.callCount).toEqual(1);
            expect(interact.say.argsForCall[0]).toEqual([{ text: "Text 1" }, 'responder']);

            world.getRandomInRange.andReturn(1);

            processor.processResponse(response, 'responder');
            expect(world.getRandomInRange).toHaveBeenCalledWith(0, 1);

            expect(interact.say.callCount).toEqual(2);
            expect(interact.say.argsForCall[1]).toEqual([{ text: "Text 2" }, 'responder']);
        });
        it("randomly chooses only among eligible responses", function() {
            var response = getResponseForResponses([ response1, response2, response3 ]);
            interact.say = jasmine.createSpy("say");
            world.getState = function(id) { return id !== 'cond2';};

            world.getRandomInRange.andReturn(0);

            processor.processResponse(response, 'responder');
            expect(world.getRandomInRange).toHaveBeenCalledWith(0, 1);

            expect(interact.say.callCount).toEqual(1);
            expect(interact.say.argsForCall[0]).toEqual([{ text: "Text 1" }, 'responder']);

            world.getRandomInRange.andReturn(1);

            processor.processResponse(response, 'responder');
            expect(world.getRandomInRange).toHaveBeenCalledWith(0, 1);

            expect(interact.say.callCount).toEqual(2);
            expect(interact.say.argsForCall[1]).toEqual([{ text: "Text 3" }, 'responder']);
        });

    });
    describe("calls", function () {
        it("should call the specified topics", function() {
            interact.call = jasmine.createSpy("call");
            var response = {
                does: { common: [ { calls: [ "aTopic", "bTopic", "cTopic" ] } ] }
            };
            processor.processResponse(response, 'responder');
            expect(interact.call).toHaveBeenCalledWith([ "aTopic", "bTopic", "cTopic" ]);
        });
    });
    describe("animates", function () {
        it("should animate", function() {
            interact.animate = jasmine.createSpy("animate");
            var response = {
                does: { common: [ { animates: {selector: "aselector", transitions: [{to: "options", lasting: 1000} ] } } ] }
            };
            processor.processResponse(response, 'responder');
            expect(interact.animate).toHaveBeenCalledWith( {selector: "aselector", transitions: [ {to: "options", lasting: 1000} ] } );
        });
    });
    describe("invokes", function () {
        it("should invoke the specified function", function() {
            interact.invoke = jasmine.createSpy("invoke");
            var response = {
                does: { common: [ { invokes: "some function body" } ] }
            };
            processor.processResponse(response, 'responder');
            expect(interact.invoke).toHaveBeenCalledWith("some function body");
        });
    });
    describe("moves", function () {
        it("should set the specified object parent", function() {
            world.setParent = jasmine.createSpy("setParent");
            var response = {
                does: { common: [ { moves: { target: "thing", to: "room"} } ] }
            };
            processor.processResponse(response, 'responder');
            expect(world.setParent).toHaveBeenCalledWith("thing", "room");
        });
        it("should set the responder parent if no target is specified", function() {
            world.setParent = jasmine.createSpy("setParent");
            var response = {
                does: { common: [ { moves: { target: "", to: "room"} } ] }
            };
            processor.processResponse(response, 'responder');
            expect(world.setParent).toHaveBeenCalledWith("responder", "room");
        });
    });
    describe("suggests", function () {
        it("should suggest the topics", function() {
            interact.suggest = jasmine.createSpy("suggest");
            var response = {
                does: { common: [ { suggests: {keywords: [{keyword: "topicA"}, {keyword: "topicB"}, {keyword: "topicC"}] } } ] }
            };
            processor.processResponse(response, 'responder');
            expect(interact.suggest).toHaveBeenCalledWith({keywords: [{keyword: "topicA"}, {keyword: "topicB"}, {keyword: "topicC"}]});
        });
    });
    describe("addTopics", function () {
        it("should add the topics to the responder if a target is not specified", function() {
            var response = {
                does: { common: [ { adds: {keywords: [{keyword: "topicA", weight: 1}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 1}] } } ] }
            };
            processor.processResponse(response, 'responder');

            expect(world.addTopics).toHaveBeenCalledWith("responder", [{keyword: "topicA", weight: 1}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 1}], undefined);
        });
        it("should add the topics to the specified target", function() {
            var response = {
                does: { common: [ { adds: {keywords: [{keyword: "topicA", weight: 1}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 1}], actor: "aTarget" } }] }
            };
            processor.processResponse(response, 'responder');
            expect(world.addTopics).toHaveBeenCalledWith("aTarget", [{keyword: "topicA", weight: 1}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 1}], undefined);
        });
        it("should add the topics to the specified cluster", function() {
            var response = {
                does: { common: [ { adds: {keywords: [{keyword: "topicA", weight: 1}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 1}], cluster: "clusterA" } }] }
            };
            processor.processResponse(response, 'responder');
            expect(world.addTopics).toHaveBeenCalledWith("responder", [{keyword: "topicA", weight: 1}, {keyword: "topicB", weight: 1}, {keyword: "topicC", weight: 1}], "clusterA");
        });
    });
    describe("resets", function () {
        it("should reset the current response", function() {
            interact.say = jasmine.createSpy("say");
            var response = {
                does: {
                    1: [
                        { says: { text: "Hello world!" }}
                    ],
                    2: [
                        { resets: {} }
                    ]
                }
            };
            processor.processResponse(response, 'responder');
            expect(interact.say.callCount).toBe(1);
            processor.processResponse(response, 'responder');
            expect(interact.say.callCount).toBe(1);
            processor.processResponse(response, 'responder');
            expect(interact.say.callCount).toBe(2);
        });
    });
    describe("clears", function () {
        it("should clear the screen", function() {
            interact.clear = jasmine.createSpy("clear");
            var response = {
                does: { common: [ { clears: {} } ] }
            };
            processor.processResponse(response, 'responder');
            expect(interact.clear).toHaveBeenCalledWith({});
        });
    });
    describe("adjusts", function () {
        var values = {
            var1: 0.0,
            target: 1,
            increment: 0.5
        };
        beforeEach(function() {
            world.getState = function(id, responder) {
                return values[id];
            };
            world.setState = jasmine.createSpy('setState');
        });
        it("should adjust the specified variable", function() {
            world.setParent = jasmine.createSpy("setParent");
            var response = {
                does: {
                    common: [
                        {
                            adjusts: {
                                variable: 'var1',
                                toward: 'target',
                                stepping: 'increment'
                            }
                        }
                    ]
                }
            };
            processor.processResponse(response, 'responder');
            expect(world.setState).toHaveBeenCalledWith({expression: 'var1=0.5'}, 'responder');
        });
        it("should set the responder parent if no target is specified", function() {
            world.setParent = jasmine.createSpy("setParent");
            var response = {
                does: { common: [ { moves: { target: "", to: "room"} } ] }
            };
            processor.processResponse(response, 'responder');
            expect(world.setParent).toHaveBeenCalledWith("responder", "room");
        });
    });
});
