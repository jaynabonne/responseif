describe('rif_load', function(){
    "use strict;"

    it('should return an empty array for empty data', function() {
        var load_file = jasmine.createSpy('load_file');
        var load = new rifLoad(load_file);
        var resulting_tokens;
        load.loadTokens('testfile', function(tokens) {
            resulting_tokens = tokens;
        });

        expect(load_file).toHaveBeenCalledWith('testfile', jasmine.any(Function));
        load_file.mostRecentCall.args[1]("");
        expect(resulting_tokens).toEqual([]);
    });
    it('should return tokens for simple data', function() {
        var load_file = jasmine.createSpy('load_file');
        var load = new rifLoad(load_file);
        var resulting_tokens;
        load.loadTokens('testfile', function(tokens) {
            resulting_tokens = tokens;
        });

        expect(load_file).toHaveBeenCalledWith('testfile', jasmine.any(Function));
        load_file.mostRecentCall.args[1](".token1 value1 .token2 value2");
        expect(resulting_tokens).toEqual(
            [
                {token:"token1", value:"value1"},
                {token:"token2", value:"value2"}
            ]
        );
    });
});
