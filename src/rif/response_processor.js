define(['./response_core', './fuzzy'], function (RifResponseCore, RifFuzzy) {
    "use strict";
    var type = function(caller, interact, topics, world) {
        this.caller = caller;
        this.interact = interact;
        this.topics = topics;
        this.world = world;
    };

    var proto = type.prototype;

    function getCurrentSection(response) {
        var section = undefined;
        var does = response.does;
        if (does) {
            section = does[response.run.toString()];
            if (!section) {
                section = does.common;
            }
        }
        return section;
    }

    function incrementResponseRunCount(response, world) {
        response.run = (response.run || world.getResponseRuns(response.id)) + 1;
        world.setResponseRuns(response.id, response.run);
    }

    proto.process_says = function (action, responder) {
        this.interact.say(action.says, responder);
    };

    proto.process_sets = function (action, responder) {
        this.world.setState(action.sets, responder || "");
    };

    proto.process_uses = function (action, responder) {
        var self = this;
        if (action.uses.all) {
            $.each(action.uses.all, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, self.topics, responder, self.world)) {
                    self.processResponse(child, responder);
                }
            });
        }
        if (action.uses.first) {
            $.each(action.uses.first, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, self.topics, responder, self.world)) {
                    self.processResponse(child, responder);
                    return false;
                }
            });
        }
        if (action.uses.random) {
            var list = [];
            $.each(action.uses.random, function(index, child) {
                if (RifResponseCore.responseIsEligible(child, self.topics, responder, self.world)) {
                    list.push(child);
                }
            });
            if (list.length !== 0) {
                var index = this.world.getRandomInRange(0, list.length-1);
                self.processResponse(list[index], responder);
            }
        }
    };

    proto.process_calls = function (action) {
        this.interact.call(action.calls);
    };

    proto.process_animates = function (action) {
        this.interact.animate(action.animates);
    };

    proto.process_invokes = function (action) {
        this.interact.invoke(action.invokes);
    };

    proto.process_moves = function(action, responder) {
        this.world.setParent(action.moves.target || responder, action.moves.to);
    };

    proto.process_suggests = function (action) {
        this.interact.suggest(action.suggests);
    };

    proto.process_adds = function (action, responder) {
        this.world.addPersistentTopics(action.adds.to || responder, action.adds.keywords);
    };

    proto.process_resets = function (action, responder, response) {
        response.run = 0;
    };

    proto.process_adjusts = function (action, responder, response) {
        var adjusts = action.adjusts;
        var value = this.world.getState(adjusts.variable, responder);
        var target = this.world.getState(adjusts.toward, responder);
        var increment = this.world.getState(adjusts.stepping, responder);
        var new_value = RifFuzzy.adjust(value, target, increment);
        this.world.setState({expression: adjusts.variable+'='+new_value}, responder);
    };

    proto.processResponse = function(response, responder) {
        incrementResponseRunCount(response, this.world);
        var section = getCurrentSection(response);
        if (section) {
            var self = this;
            $.each(section, function(index, action) {
                $.each(action, function(key) {
                    self['process_'+key](action, responder, response);
                });
            });
        }
    };

    return type;
});
