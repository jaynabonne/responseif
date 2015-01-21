var RifWorld = (function() {
    "use strict";
    var RifWorld = function() {
        this.values = {};
    };

    var proto = RifWorld.prototype;
    proto.getState = function(id) {
        return this.values[id];
    };
    proto.setState = function(id, value) {
        this.values[id] = value;
    };
    
    return RifWorld;
})();