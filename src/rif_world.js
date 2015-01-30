var RifWorld = (function() {
    "use strict";
    var RifWorld = function() {
        this.values = {};
        this.children = {};
    };

    var proto = RifWorld.prototype;
    proto.getValue = function(id) {
        return this.values[id];
    };
    proto.setValue = function(id, value) {
        this.values[id] = value;
    };
    proto.getState = function(id, responder) {
        if (id[0] === "!") {
            return !this.getValue(id.substr(1));
        } else {
            return this.getValue(id);
        }
    };
    proto.setState = function(id, responder) {
        var index = id.indexOf("=");
        if (index != -1) {
            var value = id.substring(index+1);
            id = id.substring(0, index);
            this.setValue(id, value);
        } else if (id[0] === "!") {
            this.setValue(id.substr(1), false);
        } else {
            this.setValue(id, true);
        }
    };

    proto.addRif = function(rif) {
        if (rif.sets) {
            var self = this;
            $.each(rif.sets, function(index, value) {
                self.setState(value);
            });
        }
    };

    proto.setParent = function(o, parent) {
        this.setValue(o + ":parent", parent);
        this.children[parent] = this.getChildren(parent);
        this.children[parent].push(o);
    };

    proto.getParent = function(o) {
        return this.getState(o + ":parent");
    };

    proto.getChildren = function(parent) {
        return this.children[parent] || [];
    };

    return RifWorld;
})();