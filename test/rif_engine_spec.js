describe('rif_engine', function() {
   "use strict";
    var engine;
    function loadFile(name, completion) {
        completion('');
    }
    beforeEach(function() {
        var params = {
            rif_file: 'somefile',
            load_file: loadFile,
            dom: jasmine.createSpyObj('dom', ['append', 'createDiv'])
        };
        engine = new RifEngine(params);
    });
    it('should create a world', function() {
        expect(engine.getWorld()).not.toBeNull();
    });
    it('should create an interact', function() {
        expect(engine.getInteract()).not.toBeNull();
    });
});
