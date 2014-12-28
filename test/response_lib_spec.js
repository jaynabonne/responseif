describe("ResponseLib", function () {
    "use strict";
    var responseLib;
    var interact;
    beforeEach(function () {
        interact = {};
        responseLib = new ResponseLib(interact);
    });

    describe("responseIsEligible", function () {
        it("returns true for a simple response", function () {
            expect(responseLib.responseIsEligible({})).toEqual(true);
        });
        it("returns false if the run equals or exceeds its runs", function () {
            var response = { run: 5, runs: 5 };
            expect(responseLib.responseIsEligible(response)).toEqual(false);
        });
        it("returns false if required state is not set", function () {
            interact.getState = function(id) { return false; };
            var response = { needs: ["somestate"] };
            expect(responseLib.responseIsEligible(response)).toEqual(false);
        });
        it("returns false if disallowed state is set", function () {
            interact.getState = function(id) { return false; };
            var response = { needs: ["!somestate"] };
            expect(responseLib.responseIsEligible(response)).toEqual(true);
        });
        it("returns correct value for multiple state", function () {
            interact.getState = function(id) { return id === "somestate"; };
            var response = { needs: ["somestate", "!someotherstate"] };
            expect(responseLib.responseIsEligible(response)).toEqual(true);
        });
    });
});
