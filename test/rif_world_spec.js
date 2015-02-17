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
        it("should invoke getValue for a bare id", function () {
            world.getValue.andReturn(true);
            expect(world.getState("somestate")).toBe(true);
            expect(world.getValue).toHaveBeenCalledWith("somestate");
        });
        it("should invert the getValue value for !id", function () {
            world.getValue.andReturn(true);
            expect(world.getState("!somestate")).toBe(false);
            expect(world.getValue).toHaveBeenCalledWith("somestate");
        });
    });
    describe("setState", function() {
        beforeEach(function () {
            world.setValue = jasmine.createSpy("setValue");
        });
        it("should invoke the setValue with true for a bare id", function() {
            world.setState("somestate");
            expect(world.setValue).toHaveBeenCalledWith("somestate", true);
        });
        it("should invoke setValue with false for a negated id", function() {
            world.setState("!somestate");
            expect(world.setValue).toHaveBeenCalledWith("somestate", false);
        });
        it("should set an explicit value", function() {
            world.setState("somestate=somevalue");
            expect(world.setValue).toHaveBeenCalledWith("somestate", "somevalue");
        });
    });
    describe("addRif", function() {
        it("sets variables from the 'sets' array", function() {
            var rif = { sets: ["somestate", "somevar=314", "!visited"]};
            world.addRif(rif);
            expect(world.getValue("somestate")).toBe(true);
            expect(world.getValue("somevar")).toBe("314");
            expect(world.getValue("visited")).toBe(false);
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
        it("returns the current pov's siblings", function() {
            world.setParent("thepov", "theparent");
            world.setParent("sibling1", "theparent");
            world.setParent("sibling2", "theparent");
            var responders = world.getCurrentResponders("thepov");
            expect(responders.indexOf("sibling1")).not.toBe(-1);
            expect(responders.indexOf("sibling2")).not.toBe(-1);
        });
    });
});
