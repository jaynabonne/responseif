
describe("elevator action", function() {
    beforeEach(function() {
        engine = createTestEngine(function(result) {
            engine = result;
            engine.world.setParent('player', 'hallway');
        });
    });

    it('should respond to the elevator keyword at start', function() {
        verifyThereIsAResponseTo(engine, ["elevator"]);
    })
});




