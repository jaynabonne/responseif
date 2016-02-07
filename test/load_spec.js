define(['rif_tokenize', 'rif_parse', 'rif_expand'] , function(rifTokenize, rifParse, rifExpand) {
    describe("loadTest", function () {
        it("should load data properly", function() {
            var rifSource = $.ajax({
                url: "base/data/sample_rif.txt",
                async: false
            }).responseText;

            var tokens = rifTokenize(rifSource);
            rifExpand(tokens, function(tokens) {
                var rif  = rifParse(tokens);
                console.info(rif);
            });
        });
    });
});
