var ResponseLib = (function () {
    "use strict";
    var type = function (interact) {
        this.interact = interact;
    };

    function hasRunAndRuns(response) { return response.runs !== undefined && response.run !== undefined; }

    function responseCountValid(response) { return !hasRunAndRuns(response) || response.run < response.runs; }

    var proto = type.prototype;

    proto.stateNeedIsMet = function(id) {
        if (id[0] === '!') {
            return !this.interact.getState(id.substr(1));
        } else {
            return this.interact.getState(id);
        }
    };

    proto.responseNeedsAreMet = function(response) {
        if (response.needs) {
            for (var i = 0; i < response.needs.length; ++i) {
                if (!this.stateNeedIsMet(response.needs[i])) {
                    return false;
                }
            }
        }
        return true;
    };
    proto.responseIsEligible = function(response, topics) {
        return responseCountValid(response) &&
                this.responseNeedsAreMet(response);
    };
    return type;
})();
