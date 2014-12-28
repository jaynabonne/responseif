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
    });
});
