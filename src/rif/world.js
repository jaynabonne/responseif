define(['./expression','./fuzzy'], function(RifExpression, RifFuzzy) {
    "use strict";
    var type = function() {
        this.values = {};
        this.runs = {};
        this.children = {};
        this.pov = "player";
        this.persistentTopics = {};
    };

    var proto = type.prototype;
    proto.getValue = function(id) {
        return this.values[id];
    };
    proto.setValue = function(id, value) {
        //console.log("set value", "'"+id+"'", "to", "'"+value+"'");
        this.values[id] = value;
    };
    proto.getState = function(id, responder) {
        return RifExpression.evaluate(RifExpression.compile(id), this.values, responder);
    };
    function getTarget(expression, responder){
        if (expression[0] === ':') {
            return responder + expression;
        } else if (expression.indexOf(':') === -1) {
            return responder + ':' + expression;
        }
        return expression;
    }
    var set_matchers = [
        {
            regex: /^not\s+(.+)$/,
            handler: function(world, matches, responder) {
                world.setValue(getTarget(matches[1], responder), 0.0);
            }
        },
        {
            regex: /^un\s+(.+)$/,
            handler: function(world, matches, responder) {
                world.setValue(getTarget(matches[1], responder), -1.0);
            }
        },
        {
            regex: /^more\s+(.+)$/,
            handler: function(world, matches, responder) {
                var target = getTarget(matches[1], responder);
                world.setValue(target, RifFuzzy.more(world.getState(target)));
            }
        },
        {
            regex: /^less\s+(.+)$/,
            handler: function(world, matches, responder) {
                var target = getTarget(matches[1], responder);
                world.setValue(target, RifFuzzy.less(world.getState(target)));
            }
        },
        {
            regex: /^(.+)$/,
            handler: function(world, matches, responder) {
                world.setValue(getTarget(matches[1], responder), 1.0);
            }
        }
    ];
    proto.setState = function(state, responder) {
        var expression = state.expression;
        if (state.to !== undefined) {
            this.setValue(getTarget(expression, responder), state.to);
        } else {
            var index = expression.indexOf("=");
            if (index != -1) {
                var value = expression.substring(index + 1);
                var variable = expression.substring(0, index).trim();
                this.setValue(getTarget(variable, responder), this.getState(value, responder));
            } else {
                var self = this;
                $.each(set_matchers, function(index, matcher) {
                    var matches = matcher.regex.exec(expression);
                    if (matches) {
                        matcher.handler(self, matches, responder);
                        return false;
                    }
                })
            }
        }
    };

    proto.addRif = function(rif) {
        this.rif = rif;
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
        responders = responders.concat(this.getChildren(pov));
        if (!parent) {
            return responders;
        }
        responders.push(parent);
        pushAncestorsOf.call(this, responders, parent);
        return responders.concat(this.getChildren(parent));
    };

    proto.getRandomInRange = function(minimum, maximum) {
        return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    };

    proto.getTopics = function(actor) {
        return this.persistentTopics[actor] || [];
    };

    proto.addTopics = function(actor, topics) {
        this.removeTopics(actor, topics);
        var currentTopics = this.getTopics(actor);
        this.persistentTopics[actor] = currentTopics.concat(topics);
    };

    proto.removeTopics = function(actor, topics) {
        var keywords = topics.map(function(value) { return value.keyword; });
        var currentTopics = this.getTopics('actor');
        for(var i = currentTopics.length - 1; i >= 0; i--) {
            if(keywords.indexOf(currentTopics[i].keyword) != -1) {
                currentTopics.splice(i, 1);
            }
        }
    };

    proto.getResponseRuns = function(id) {
        return this.runs[id] || 0;
    };

    proto.setResponseRuns = function(id, runs) {
        this.runs[id] = runs;
    };

    return type;
});
