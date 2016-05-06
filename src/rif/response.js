define(['./response_core','./response_processor','./priority_response_getter'], function (RifResponseCore, RifResponseProcessor, RifPriorityResponseGetter) {
    "use strict";
    var type = function (world) {
        this.world = world;
        this.types = [];
    };

    var proto = type.prototype;

    function groupCandidates(candidates, prompts) {
        var groups = { };
        candidates.forEach(function (candidate) {
            if (candidate.response.prompts) {
                prompts.push(candidate);
            } else {
                var type = candidate.response.is || "default";
                if (!groups[type]) {
                    groups[type] = [];
                }
                groups[type].push(candidate);
            }
        });
        return groups;
    }

    function orderCompare(a, b) {
        return (a.response.orders || 1) - (b.response.orders || 1);
    }

    function processGroup(group, processor) {
        group.sort(orderCompare);
        group.forEach(function(candidate) { processor.processResponse(candidate.response, candidate.responder); });
    }

    function addPrompt(items, candidate) {
        var prompt = candidate.response.prompts;
        if (items.indexOf(prompt) === -1) {
            items.push(prompt);
        }
    }

    function getMenuItems(prompts) {
        var items = [];
        prompts.forEach(function (candidate) { addPrompt(items, candidate); });
        return items;
    }

    function processMenuResponses(prompt, prompts, processor) {
        prompts.forEach(function (candidate) {
            if (candidate.response.prompts === prompt) {
                processor.processResponse(candidate.response, candidate.responder);
            }
        });
    }

    function runMenu(prompts, processor, interact) {
        var items = getMenuItems(prompts);
        interact.choose(items, function (which) {
            if (which !== -1) {
                processMenuResponses(items[which], prompts, processor);
            }
        });
    }

    function forcesPrompt(response) {
        return response.forcesprompt === undefined || response.forcesprompt;
    }

    function processPrompts(prompts, processor, interact) {
        if (prompts.length === 1 && !forcesPrompt(prompts[0].response)) {
            processGroup(prompts, processor);
        } else if (prompts.length > 0) {
            runMenu(prompts, processor, interact);
        }
    }

    function processDefinedGroups(groups, processor, types) {
        types.forEach(function (type) {
            if (groups.hasOwnProperty(type)) {
                processGroup(groups[type], processor);
                groups[type] = undefined;
            }
        });
    }

    function processGroups(groups, processor) {
        $.each(groups, function(index, group) {
            if (group) {
                processGroup(group, processor);
            }
        });
    }

    proto.processResponses = function (candidates, caller, topics, interact) {
        var prompts = [];
        var groups = groupCandidates(candidates, prompts);

        var processor = new RifResponseProcessor(caller, interact, topics, this.world);

        processDefinedGroups(groups, processor, this.types);
        processGroups(groups, processor);
        processPrompts(prompts, processor, interact);
    };

    proto.setTypes = function(types) {
        this.types = types;
    };

    proto.getCandidateResponses = function(responders, topics) {
        var world = this.world;
        var candidates = [];
        $.each(responders, function(responder) {
            var responses = responders[responder];
            if (responses) {
                candidates = candidates.concat(RifResponseCore.selectResponses(responses, topics, responder, world));
            }
        });
        return candidates;
    };

    proto.callTopics = function(responders, topics, caller, interact) {

        var candidates = this.getCandidateResponses(responders, topics);
        candidates = RifPriorityResponseGetter.getPriorityResponses(candidates);

        this.processResponses(candidates, caller, topics, interact);
    };

    return type;
});
