var ResponseLib = (function () {
    "use strict";
    var type = function () {
    };

    var proto = type.prototype;
    proto.responseIsEligible = function(response, topics) {
        return true;
    };
    return type;
})();
