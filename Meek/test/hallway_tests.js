describe("hallway responses", function() {
    var engine;

    beforeEach(function() {
        engine = createTestEngine(function(result) {
            engine = result;
            engine.world.setParent('player', 'hallway');
        });
    });

    it("supports look", function() {
        verifyThereIsAResponseTo(engine, ["LOOK"]);
    });
    it("has a way to move to the mining nexus", function() {
        verifyThereIsAResponseTo(engine, ["MOVE", "MINING_NEXUS"]);
    });
    it("has a way to move to the controller corridor", function() {
        verifyThereIsAResponseTo(engine, ["MOVE", "CONTROLLER_CORRIDOR"]);
    });
});
