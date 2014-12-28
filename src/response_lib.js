var ResponseLib = (function () {
    "use strict";
    var type = function () {
    };

    function hasRunAndRuns(response) { return response.runs !== undefined && response.run !== undefined; }

    function responseCountValid(response) { return !hasRunAndRuns(response) || response.run < response.runs; }

    var proto = type.prototype;
    proto.responseIsEligible = function(response, topics) {
        return responseCountValid(response);
    };
    return type;
})();
