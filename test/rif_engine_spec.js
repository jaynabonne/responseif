describe('rif_engine', function() {
   "use strict";
    var dom;
    var engine;
    beforeEach(function() {
        dom = jasmine.createSpyObj('dom', ['append', 'createDiv']);
        engine = new RifEngine('somefile', loadFile, dom);
    });
    function loadFile(name, completion) {
        completion('');
    }
    it('should create a world', function() {
        expect(engine.getWorld()).not.toBeNull();
    });
    it('should create an interact', function() {
        expect(engine.getInteract()).not.toBeNull();
    });
});
