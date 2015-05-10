describe('rif_engine', function() {
   "use strict";
    beforeEach(function() {
        
    });
    it('should create a world', function() {
        var dom = jasmine.createSpyObj('dom', ['append']);
        var engine = new RifEngine(dom);
        expect(engine.getWorld()).not.toBeNull();
    });
    it('should create an interact', function() {
        var dom = jasmine.createSpyObj('dom', ['append']);
        var engine = new RifEngine(dom);
        expect(engine.getInteract()).not.toBeNull();
    });
});
