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
    function createInteract(world, rif) {
        var dom = new RifDOM($('#output'));
        var formatter = new RifHtmlFormatter();
        var response_lib = new RifResponse(world);
        return new RifInteract(dom, formatter, world, response_lib, rif);
    }
    function init() {
        this.world = new RifWorld();

        loadRif("sample_rif.txt", world, function(rif) {
            var interact = createInteract(world, rif);
            //console.info("rif=", rif)

            interact.sendCommand(["START"]);
        });
    }
    var type = function() {
        init();
    };
    return type;
})();