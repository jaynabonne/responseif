define(['rif/world'], function(RifWorld) {
describe("RifWorld", function () {
    "use strict";
    var world;
    beforeEach(function () {
        world = new RifWorld();
    });
    describe("getValue and setValue", function() {
        it("should return undefined for a non-set value", function() {
            expect(world.getValue("zzjjklkdsfk")).toBe(undefined);
        });
        it("should return a set value", function() {
            world.setValue("somestate", 314);
            expect(world.getValue("somestate")).toBe(314);
        });
        it("should return different set values", function() {
            world.setValue("somestate", 314);
            world.setValue("someotherstate", "yay");
            expect(world.getValue("somestate")).toBe(314);
            expect(world.getValue("someotherstate")).toBe("yay");
        });
    });
    describe("getState", function() {
        beforeEach(function () {
            world.getValue = jasmine.createSpy("getValue");
        });
    });
    describe("setState", function() {
        beforeEach(function () {
            world.setValue = jasmine.createSpy("setValue");
        });
        it("should invoke the setValue with 1 for a bare id", function() {
            world.setState({expression: "somestate"});
            expect(world.setValue).toHaveBeenCalledWith("somestate", 1.0);
            world.setState({expression: ":somestate"}, 'responder');
            expect(world.setValue).toHaveBeenCalledWith("responder:somestate", 1.0);
        });
        it("should invoke setValue with 0 for a negated id", function() {
            world.setState({expression: "not somestate"});
            expect(world.setValue).toHaveBeenCalledWith("somestate", 0.0);
            world.setState({expression: "not :somestate"}, 'responder');
            expect(world.setValue).toHaveBeenCalledWith("responder:somestate", 0.0);
        });
        it("should invoke setValue with -1 for an 'un' id", function() {
            world.setState({expression: "un somestate"});
            expect(world.setValue).toHaveBeenCalledWith("somestate", -1.0);
            world.setState({expression: "un :somestate"}, 'responder');
            expect(world.setValue).toHaveBeenCalledWith("responder:somestate", -1.0);
        });
        it("should set an explicit value", function() {
            world.setState({expression: "somestate=678"});
            expect(world.setValue).toHaveBeenCalledWith("somestate", 678);
            world.setState({expression: ":somestate=678"}, 'responder');
            expect(world.setValue).toHaveBeenCalledWith("responder:somestate", 678);
        });
    });
    describe("addRif", function() {
        it("sets variables from the 'sets' array", function() {
            var rif = { sets: [
                {expression:"somestate"},
                {expression:"somevar=314"},
                {expression:"not visited"},
                {expression:"astring", to:"not visited"}
            ]};
            world.addRif(rif);
            expect(world.getValue("somestate")).toBe(1);
            expect(world.getValue("somevar")).toBe(314);
            expect(world.getValue("visited")).toBe(0);
            expect(world.getValue("astring")).toBe("not visited");
        });
        it("set parents of objects in the 'moves' array", function() {
            var rif = {moves: [{target: "object1", to: "parent1"}, {target: "object2", to: "parent2"}]};
            world.addRif(rif);
            expect(world.getParent("object1")).toBe("parent1");
            expect(world.getParent("object2")).toBe("parent2");
        });
    });
    describe("setParent", function() {
        it("sets the parent state for the child", function() {
            world.setParent("child_object", "parent_object");
            expect(world.getValue("child_object:parent")).toBe("parent_object");
        });
        it("sets the new parent state for the child", function() {
            world.setParent("child_object", "parent_object");
            world.setParent("child_object", "parent_object2");
            expect(world.getParent("child_object")).toBe("parent_object2");
        });
    });
    describe("getChildren", function() {
        it("returns an empty array by default", function() {
            expect(world.getChildren("someobject")).toEqual([]);
        });
        it("returns a set child", function() {
            world.setParent("child_object", "parent_object");
            expect(world.getChildren("parent_object")).toEqual(["child_object"]);
        });
        it("returns a set child for multiple parents", function() {
            world.setParent("child_object1", "parent_object1");
            world.setParent("child_object2", "parent_object2");
            expect(world.getChildren("parent_object1")).toEqual(["child_object1"]);
            expect(world.getChildren("parent_object2")).toEqual(["child_object2"]);
        });
        it("returns a set child for successive parents", function() {
            world.setParent("child_object", "parent_object1");
            world.setParent("child_object", "parent_object2");
            expect(world.getChildren("parent_object1")).toEqual([]);
            expect(world.getChildren("parent_object2")).toEqual(["child_object"]);
        });
    });
    describe("getParent", function() {
        it("returns an empty string for no parent", function() {
            expect(world.getParent("child_object")).toBe("");
        });
        it("gets the parent state for the child", function() {
            world.setParent("child_object", "parent_object");
            expect(world.getParent("child_object")).toBe("parent_object");
        });
    });
    describe("getPOV", function() {
        it("returns 'player' by default", function() {
            expect(world.getPOV()).toBe("player");
        });
    });
    describe("setPOV", function() {
        it("sets the POV returned by getPOV", function() {
            world.setPOV("newplayer");
            expect(world.getPOV()).toBe("newplayer");
        });
    });
    describe("getCurrentResponders", function() {
        it("returns the pov passed", function() {
            var responders = world.getCurrentResponders("thepov");
            expect(responders.indexOf("thepov")).not.toBe(-1);
        });
        it("returns the current pov's parent", function() {
            world.setParent("thepov", "theparent");
            var responders = world.getCurrentResponders("thepov");
            expect(responders.indexOf("theparent")).not.toBe(-1);
        });
        it("returns the current pov's children", function() {
            world.setParent("responder", "thepov");
            var responders = world.getCurrentResponders("thepov");
            expect(responders.indexOf("responder")).not.toBe(-1);
        });
        it("returns the current pov's siblings", function() {
            world.setParent("thepov", "theparent");
            world.setParent("sibling1", "theparent");
            world.setParent("sibling2", "theparent");
            var responders = world.getCurrentResponders("thepov");
            expect(responders.indexOf("sibling1")).not.toBe(-1);
            expect(responders.indexOf("sibling2")).not.toBe(-1);
        });
        it("returns 'everywhere'", function() {
            var responders = world.getCurrentResponders("thepov");
            expect(responders.indexOf("everywhere")).not.toBe(-1);
        });
        it("returns children of 'everywhere'", function() {
            world.setParent("responder", "everywhere");
            var responders = world.getCurrentResponders("thepov");
            expect(responders.indexOf("responder")).not.toBe(-1);
        });
        it("returns the parents of the parent, up the chain", function() {
            world.setParent("thepov", "parent");
            world.setParent("parent", "grandparent");
            world.setParent("grandparent", "adam");
            var responders = world.getCurrentResponders("thepov");
            expect(responders.indexOf("grandparent")).not.toBe(-1);
            expect(responders.indexOf("adam")).not.toBe(-1);
        });
    });
    describe("getRandomInRange", function() {
        it("returns random numbers in the specified range", function() {
            expect(world.getRandomInRange(4,4)).toBe(4);
            var hits = [0,0,0,0,0,0,0,0,0,0];
            for (var i = 0; i < 10000; ++i) {
                var result = world.getRandomInRange(1, 10);
                expect(result).toBeGreaterThan(0);
                expect(result).toBeLessThan(11);
                hits[result-1]++;
            }
            for (i = 0; i < 10; ++i) {
                expect(hits[i]).toBeGreaterThan(800);
                expect(hits[i]).toBeLessThan(1200);
            }
        });
    });

    describe('PersistentTopics', function() {
        it('returns an empty array if no topics have been set', function() {
            var topics = world.getPersistentTopics('actor');
            expect(topics).toEqual([]);
        });
        it('can add and then get a topic', function() {
            world.addPersistentTopics('actor', [{keyword: 'atopic'}]);
            var topics = world.getPersistentTopics('actor');
            expect(topics).toEqual([{keyword: 'atopic'}]);
        });
        it('can add sequential topic', function() {
            world.addPersistentTopics('actor', [{keyword: 'atopic'}]);
            world.addPersistentTopics('actor', [{keyword: 'btopic'}]);
            var topics = world.getPersistentTopics('actor');
            expect(topics).toEqual([{keyword: 'atopic'}, {keyword: 'btopic'}]);
        });
        it('can remove topic', function() {
            world.addPersistentTopics('actor', [{keyword: 'topic1'}, {keyword: 'topic2'}, {keyword: 'topic3'}, {keyword: 'topic4'}]);
            world.removePersistentTopics('actor', [{keyword: 'topic2'}, {keyword: 'topic4'}]);
            var topics = world.getPersistentTopics('actor');
            expect(topics).toEqual([{keyword: 'topic1'}, {keyword: 'topic3'}]);
        });
        it('should not duplicate existing topics', function() {
            world.addPersistentTopics('actor', [{keyword: 'atopic'}]);
            world.addPersistentTopics('actor', [{keyword: 'atopic'}]);
            var topics = world.getPersistentTopics('actor');
            expect(topics).toEqual([{keyword: 'atopic'}]);

        });
        it('should update weights for existing topics', function() {
            world.addPersistentTopics('actor', [{keyword: 'atopic', weight: 20}]);
            world.addPersistentTopics('actor', [{keyword: 'atopic', weight: 40}]);
            var topics = world.getPersistentTopics('actor');
            expect(topics).toEqual([{keyword: 'atopic', weight: 40}]);

        });
    });
    describe('get and set response runs', function() {
        it('should return 0 for response runs when not set', function() {
            expect(world.getResponseRuns(314)).toBe(0);
        });
        it('should return response runs set for a response', function() {
            world.setResponseRuns(314, 42);
            expect(world.getResponseRuns(314)).toBe(42);
        });
        it('should return response runs set for multiple responses', function() {
            world.setResponseRuns(314, 42);
            world.setResponseRuns(315, 56);
            expect(world.getResponseRuns(314)).toBe(42);
            expect(world.getResponseRuns(315)).toBe(56);
        });
    });
});
});
