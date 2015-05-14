describe("game startup and title", function() {
    var engine;

    beforeEach(function() {
        engine = createTestEngine(function(result) {
            engine = result;
        });
    });

    xit("has a way to move to the mining nexus", function() {
        engine.world.setParent('player', 'hallway');
        engine.interact.sendCommand(["MOVE MINING_NEXUS"]);
        expect(engine.world.getParent("player")).toBe("mining nexus");
    });
});
