
require(['rif/engine', 'config'], function(RifEngine, config) {
    var engine = new RifEngine;
    engine.initialize(config, function() {
        engine.start();
    });
});
