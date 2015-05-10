var RifEngine = (function() {
    function loadFile(name, completion) {
        $.ajax({
            url: "data/" + name
        }).done(completion);
    }
    function loadRif(file, world, completion) {
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
    function init(dom) {
        var self = this;
        this.world = new RifWorld();

        loadRif("sample_rif.txt", world, function(rif) {
            self.interact = createInteract(world, rif, dom);
            self.interact.sendCommand(["START"]);
        });
    }
    var type = function(dom) {
        init(dom);
    };
    type.prototype.getWorld = function() {
        return this.world;
    };
    type.prototype.getInteract = function() {
        return this.interact;
    };
    return type;
})();