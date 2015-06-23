function createTestEngine(callback) {
    var completed = false;
    runs(function() {
        var params = {
            rif_file: 'elevator.txt',
            data_root: "base/data/",
            element: $('#output')
        };
        var engine = new RifEngine(params, function() {
            callback(engine);
            completed = true;
        });
    });
    waitsFor(function() {
        return completed;
    }, "Initialize engine", 3000);
}

function verifyThereIsAResponseTo(engine, topics) {
    engine.response.processResponses = jasmine.createSpy('processResponses');
    engine.interact.sendCommand(topics);
    expect(engine.response.processResponses.callCount).toBe(1);
    var args = engine.response.processResponses.argsForCall[0];
    var responses = args[0];
    var caller = args[1];
    expect(responses.length).toBeGreaterThan(0);
    expect(caller).toEqual("player");
}
