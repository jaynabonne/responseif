
require(['rif/engine', 'config'], function(RifEngine, config) {
    var engine = new RifEngine(config, function() {
        engine.start();
    });
});
