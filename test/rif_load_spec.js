describe('rif_load', function(){
    "use strict;"
    var load_file;
    var load;
    var resulting_tokens
    beforeEach(function() {
        load_file = jasmine.createSpy('load_file');
        load = new rifLoad(load_file);
        resulting_tokens;
        load.loadTokens('testfile', function(tokens) {
            resulting_tokens = tokens;
        });

        expect(load_file).toHaveBeenCalledWith('testfile', jasmine.any(Function));
    });

    it('should return an empty array for empty data', function() {
        load_file.mostRecentCall.args[1]("");
        expect(resulting_tokens).toEqual([]);
    });
    it('should return tokens for simple data', function() {
        load_file.mostRecentCall.args[1](".token1 value1 .token2 value2");
        expect(resulting_tokens).toEqual(
            [
                {token:"token1", value:"value1"},
                {token:"token2", value:"value2"}
            ]
        );
    });
    it('should load nested files', function() {
        load_file.mostRecentCall.args[1](".a .include otherfile .c");
        expect(load_file).toHaveBeenCalledWith('otherfile', jasmine.any(Function));
        load_file.mostRecentCall.args[1](".b");
        expect(resulting_tokens).toEqual(
            [
                {token:"a", value:""},
                {token:"b", value:""},
                {token:"c", value:""}
            ]
        );
    });
});
