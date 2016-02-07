
require(['rif_engine', 'config'], function(RifEngine, config) {
    var engine = new RifEngine(config, function() {
        engine.interact.sendCommand([{keyword:"START"}]);
    });
});
