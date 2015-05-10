var RifEngine = (function() {
    function loadRif(file, loadFile, world, completion) {
        var load = new rifLoad(loadFile);
        load.loadTokens(file, function (tokens) {
            rifExpand(tokens, function(tokens) {
                var rif = rifParse(tokens);
                world.addRif(rif);
                completion(rif);
            });
        });
    }
    function createInteract(world, rif, dom) {
        var formatter = new RifHtmlFormatter();
        var response_lib = new RifResponse(world);
        return new RifInteract(dom, formatter, world, response_lib, rif);
    }
    function init(rif_file, loadFile, dom) {
        var self = this;
        this.world = new RifWorld();

        loadRif(rif_file, loadFile, world, function(rif) {
            self.interact = createInteract(world, rif, dom);
            self.interact.sendCommand(["START"]);
        });
    }
    var type = function(rif_file, loadFile, dom) {
        init(rif_file, loadFile, dom);
    };
    type.prototype.getWorld = function() {
        return this.world;
    };
    type.prototype.getInteract = function() {
        return this.interact;
    };
    return type;
})();