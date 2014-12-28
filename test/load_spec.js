describe("loadTest", function () {
    it("should load data properly", function() {
        var rifSource = $.ajax({
            url: "base/data/sample_rif.txt",
            async: false
        }).responseText;

        var tokens = rifTokenize(rifSource);
        tokens = rifExpand(tokens);
        var rif  = rifParse(tokens);
        console.info(rif);
    });
});
