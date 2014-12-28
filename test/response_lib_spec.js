describe("ResponseLib", function () {
    "use strict";
    var responseLib;
    beforeEach(function () {
        responseLib = new ResponseLib();
    });

    describe("responseIsEligible", function () {
        it("returns true for a simple response", function () {
            expect(responseLib.responseIsEligible({})).toEqual(true);
        });
        it("returns false if the run equals or exceeds its runs", function () {
            var response = { run: 5, runs: 5 };
            expect(responseLib.responseIsEligible(response)).toEqual(false);
        });
    });
});
