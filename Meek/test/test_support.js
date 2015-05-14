function createTestEngine(callback) {
    var completed = false;
    runs(function() {
        var params = {
            rif_file: 'sample_rif.txt',
            data_root: "base/data/",
            element: $('#output')
        };
        var engine = new RifEngine(params, function() {
            callback(engine);
            completed = true;
        });
    });
    waitsFor(function() {
        return completed;
    }, "Initialize engine", 3000);
}
