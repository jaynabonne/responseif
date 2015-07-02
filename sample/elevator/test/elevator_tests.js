
describe("elevator action", function() {
    beforeEach(function() {
        engine = createTestEngine(function(result) {
            engine = result;
        });
    });

    describe('At start up', function() {
        it('should position the elevator at the first floor', function() {
            expect(engine.world.getParent('elevator')).toBe('first floor');
        });
        it('should position the player in the first floor hallway', function() {
            expect(engine.world.getParent('player')).toBe('first floor hallway');
        });
        it('should have the doors closed', function() {
            expect(engine.world.getState('elevator:door open')).toBeFalsy();
            expect(engine.world.getState('first floor:door open')).toBeFalsy();
            expect(engine.world.getState('second floor:door open')).toBeFalsy();
            expect(engine.world.getState('third floor:door open')).toBeFalsy();
        });
        it('should have all buttons unlit', function() {
            expect(engine.world.getState('first floor:button pressed')).toBeFalsy();
            expect(engine.world.getState('second floor:button pressed')).toBeFalsy();
            expect(engine.world.getState('third floor:button pressed')).toBeFalsy();
        });
    });
    function chooseMenuItem(item) {
        expect(engine.interact.choose).toHaveBeenCalled();
        var callback = engine.interact.choose.mostRecentCall.args[1];
        callback(item);
    }

    describe('pressing the button', function() {
        it('should turn on the button', function() {
            engine.interact.choose = jasmine.createSpy('choose');
            engine.interact.sendCommand(["button"]);

            chooseMenuItem(0);

            expect(engine.world.getState('first floor hallway:button pressed')).toBeTruthy();
        });
    });
});




