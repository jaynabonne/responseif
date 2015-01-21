describe("RifWorld", function () {
    "use strict";
    describe("getState and setState", function() {
        it("should return undefined for a non-set state", function() {
            var world = new RifWorld();
            expect(world.getState("zzjjklkdsfk")).toBe(undefined);
        });
        it("should return a set state", function() {
            var world = new RifWorld();
            world.setState("somestate", 314);
            expect(world.getState("somestate")).toBe(314);
        });
        it("should return different set states", function() {
            var world = new RifWorld();
            world.setState("somestate", 314);
            world.setState("someotherstate", "yay");
            expect(world.getState("somestate")).toBe(314);
            expect(world.getState("someotherstate")).toBe("yay");
        });
    });
});

