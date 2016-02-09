
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
        function pressButton() {
            engine.interact.choose = jasmine.createSpy('choose');
            engine.interact.sendCommand(["button"]);
            console.log("choose menu item");
            chooseMenuItem(0);
            engine.interact.sendCommand(["ACT"]);
        }
        it('should turn on the button if the elevator is on a different floor', function() {
            engine.world.setParent('elevator', 'second floor');
            pressButton();
            expect(engine.world.getState('first floor:button pressed')).toBeTruthy();
        });
        it('should cause the door to open if the elevator is on that floor', function() {
            pressButton();
            expect(engine.world.getState('first floor:door open')).toBeTruthy();
            expect(engine.world.getState('elevator:door open')).toBeTruthy();
            expect(engine.world.getState('first floor:button pressed')).toBeFalsy();
        });
    });
});

