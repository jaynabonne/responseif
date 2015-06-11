var RifWorld = (function() {
    "use strict";
    var RifWorld = function() {
        this.values = {};
        this.children = {};
        this.pov = "player";
    };

    var proto = RifWorld.prototype;
    proto.getValue = function(id) {
        return this.values[id];
    };
    proto.setValue = function(id, value) {
        this.values[id] = value;
    };
    proto.getState = function(id, responder) {
        var expression = RifExpression.compile(id);
        return RifExpression.evaluate(expression, this.values);
    };
    proto.setState = function(state, responder) {
        var expression = state.expression;
        if (state.to !== undefined) {
            this.setValue(expression, state.to);
        } else {
            var index = expression.indexOf("=");
            if (index != -1) {
                var value = expression.substring(index + 1);
                var variable = expression.substring(0, index);
                this.setValue(variable, this.getState(value, responder));
            } else if (expression.slice(0, 4) === "not ") {
                this.setValue(expression.substr(4), false);
            } else {
                this.setValue(expression, true);
            }
        }
    };

    proto.addRif = function(rif) {
        var self = this;
        if (rif.sets) {
            $.each(rif.sets, function(index, value) {
                self.setState(value);
            });
        }
        if (rif.moves) {
            $.each(rif.moves, function(index, value) {
                self.setParent(value.target, value.to);
            });
        }
    };

    function removeChild(world, child) {
        var children = world.getChildren(world.getParent(child));
        var index = children.indexOf(child);
        if (index !== -1) {
            children.splice(index, 1);
        }
    }

    proto.setParent = function(child, parent) {
        var old_parent = this.getParent(child);
        if (old_parent === parent)
            return;
        removeChild(this, child);
        this.setValue(child + ":parent", parent);
        if (parent) {
            this.children[parent] = this.getChildren(parent);
            this.children[parent].push(child);
        }
        //console.log("Set parent of " + child + " to " + parent);
    };

    proto.getParent = function(o) {
        return this.getState(o + ":parent") || "";
    };

    proto.getChildren = function(parent) {
        return this.children[parent] || [];
    };

    proto.getPOV = function() {
        return this.pov;
    };

    proto.setPOV = function(pov) {
        this.pov = pov;
    };

    function pushAncestorsOf(responders, child) {
        var parent;
        while (parent = this.getParent(child)) {
            responders.push(parent);
            child  = parent;
        }
    }
    proto.getCurrentResponders = function(pov) {
        var parent = this.getParent(pov);
        var responders = ['everywhere', pov];
        responders = responders.concat(this.getChildren('everywhere'));
        if (!parent) {
            return responders;
        }
        responders.push(parent);
        pushAncestorsOf.call(this, responders, parent);
        return responders.concat(this.getChildren(parent));
    };

    return RifWorld;
})();
