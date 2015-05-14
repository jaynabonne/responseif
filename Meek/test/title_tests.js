describe("game startup and title", function() {
    var engine;

    beforeEach(function() {
        engine = createTestEngine(function(result) {
            engine = result;
        });
    });

    it("places the player in the title room at startup", function() {
        expect(engine.world.getParent("player")).toBe("titlescreen");
    });

    it("responds to START by fading in the intro div", function() {
        engine.interact.animate = jasmine.createSpy("animate");
        engine.interact.sendCommand(["START"]);
        expect(engine.interact.animate).toHaveBeenCalledWith( jasmine.objectContaining({ selector : '#intro'}));
    });

});
