define(['./response_core','./response_processor'], function (RifResponseCore, RifResponseProcessor) {
    "use strict";
    var type = function (world) {
        this.world = world;
        this.types = [];
    };

    var PriorityResponseGetter = (function () {
        var type = function (candidates) {
            this.reset(-1);
            this.addPriorityResponses(candidates);
        };

        var proto = type.prototype;

        proto.reset = function (score) {
            this.results = [];
            this.score = score;
        };

        proto.updateScore = function (score) {
            if (score > this.score) {
                this.reset(score);
            }
        };

        proto.addResponse = function (response) {
            if (response.score === this.score) {
                this.results.push(response);
            }
        };

        proto.addPriorityResponse = function (response) {
            this.updateScore(response.score);
            this.addResponse(response);
        };

        proto.addPriorityResponses = function (candidates) {
            var self = this;
            candidates.forEach(function(response) {
                self.addPriorityResponse(response)
            });
        };

        return type;
    }());

    var proto = type.prototype;

    proto.responseIsEligible = function(response, topics, responder) {
        return RifResponseCore.responseIsEligible(response, topics, responder, this.world);
    };

    proto.addIfHasScore = function (response, topics, candidates, responder) {
        var score = RifResponseCore.computeScore(response.matches, topics);
        if (score > 0) {
            candidates.push({response: response, score: score, responder: responder});
        }
    };

    proto.addResponse = function (response, topics, candidates, responder) {
        if (this.responseIsEligible(response, topics, responder)) {
            if (response.selects !== undefined) {
                this.addResponses(response.selects, topics, candidates, responder);
            } else {
                this.addIfHasScore(response, topics, candidates, responder);
            }
        }
    };

    proto.addResponses = function (responses, topics, candidates, responder) {
        var self = this;
        var boundAdd = function (response) { self.addResponse(response, topics, candidates, responder); };
        responses.forEach(boundAdd);
        return candidates;
    };

    proto.selectResponses = function(responses, topics, responder) {
        return this.addResponses(responses, topics, [], responder);
    };

    proto.getPriorityResponses = function (candidates) {
        return new PriorityResponseGetter(candidates).results;
    };

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
        var orderA = a.response.orders || 1;
        var orderB = b.response.orders || 1;
        return orderA < orderB
                ? -1
                : orderA === orderB
                    ? 0
                    : 1;
    }

    proto.processGroup = function(group, caller, interact, topics) {
        group.sort(orderCompare);

        var processor = new RifResponseProcessor(caller, interact, topics, this.world);
        group.forEach(function(candidate) { processor.processResponse(candidate.response, candidate.responder); });
    };

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

    proto.processMenuResponses = function(prompt, prompts, caller, interact, topics) {
        var processor = new RifResponseProcessor(caller, interact, topics, this.world);
        prompts.forEach(function (candidate) {
            if (candidate.response.prompts === prompt) {
                processor.processResponse(candidate.response, candidate.responder);
            }
        });
    };

    proto.runMenu = function(prompts, caller, interact, topics) {
        var self = this;
        var items = getMenuItems(prompts);
        interact.choose(items, function (which) {
            if (which !== -1) {
                self.processMenuResponses(items[which], prompts, caller, interact, topics);
            }
        });
    };

    function forcesPrompt(response) {
        return response.forcesprompt === undefined || response.forcesprompt;
    }

    proto.processPrompts = function (prompts, caller, interact, topics) {
        if (prompts.length === 1 && !forcesPrompt(prompts[0].response)) {
            this.processGroup(prompts, caller, interact, topics);
        } else if (prompts.length > 0) {
            this.runMenu(prompts, caller, interact, topics);
        }
    };

    proto.processDefinedGroups = function(groups, caller, interact, topics) {
        var self = this;
        this.types.forEach(function (type) {
            if (groups.hasOwnProperty(type)) {
                self.processGroup(groups[type], caller, interact, topics);
                groups[type] = undefined;
            }
        });
    };

    proto.processGroups = function(groups, caller, interact, topics) {
        var self = this;
        $.each(groups, function(index, group) {
            if (group) {
                self.processGroup(group, caller, interact, topics);
            }
        });
    };

    proto.processResponses = function (candidates, caller, topics, interact) {
        var self = this;
        var prompts = [];
        var groups = groupCandidates(candidates, prompts);

        this.processDefinedGroups(groups, caller, interact, topics);
        this.processGroups(groups, caller, interact, topics);
        this.processPrompts(prompts, caller, interact, topics);
    };

    proto.setTypes = function(types) {
        this.types = types;
    };

    proto.getCandidateResponses = function(responders, topics) {
        var candidates = [];
        for (var responder in responders) {
            if (responders.hasOwnProperty(responder)) {
                var responses = responders[responder];
                if (responses) {
                    candidates = candidates.concat(this.selectResponses(responses, topics, responder));
                }
            }
        }
        return candidates;
    };

    proto.callTopics = function(responders, topics, caller, interact) {

        var candidates = this.getCandidateResponses(responders, topics);
        candidates = this.getPriorityResponses(candidates);

        this.processResponses(candidates, caller, topics, interact);
    };

    return type;
});
