var RifEngine = (function() {
    function loadRif(params, completion) {
        params.load.loadTokens(params.rif_file, function (tokens) {
            rifExpand(tokens, function(tokens) {
                var rif = rifParse(tokens);
                params.world.addRif(rif);
                completion(rif);
            });
        });
    }
    function createInteract(params, rif) {
        return new RifInteract(params.dom, params.formatter, params.world, params.response, rif);
    }
    function expandParams(params) {
        params.world = params.world || new RifWorld();
        params.response = params.response || new RifResponse(params.world);
        params.formatter = params.formatter || new RifHtmlFormatter();
        params.load = params.load || new rifLoad(params.load_file);
    }
    function init(params) {
        expandParams(params);
        var self = this;

        loadRif(params, function(rif) {
            self.interact = createInteract(params, rif);
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