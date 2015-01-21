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

    });
});

