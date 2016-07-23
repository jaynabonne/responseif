define([], function () {
    "use strict";

    var core = {};

    function hasRunAndOccurs(response) { return response.occurs !== undefined; }

    function responseCountValid(response, world) {
        response.run = response.run || world.getResponseRuns(response.id);
        return !hasRunAndOccurs(response) || response.run < response.occurs;
    }

    function hasTopics(response) { return response.matches !== undefined; }

    function isRequiredTopic(topic) { return topic.keyword[0] === "*"; }

    function extractTopic(topic) { return isRequiredTopic(topic) ? { keyword: topic.keyword.substring(1), weight: topic.weight} : topic; }

    function hasRequiredTopics(matches, topics) {
        for (var i = 0; i < matches.length; ++i) {
            var topic = matches[i];
            if (isRequiredTopic(topic) && !keywordInTopics(extractTopic(topic).keyword, topics)) {
                return false;
            }
        }
        return true;
    }

    function responseRequiredTopicsAreDefined(response, topics) {
        return (!hasTopics(response) || hasRequiredTopics(response.matches, topics)) && hasRequiredTopics(topics, response.matches);
    }

    function keywordInTopics(keyword, topics) {
        var found = false;
        $.each(topics, function(index, value) {
            if (value.keyword === keyword) {
                found = true;
            }
            return !found;
        });
        return found;
    }

    function getTopicWeight(topic) {
        return (topic.weight === undefined) ? 1 : topic.weight;
    }

    function computeTopicScore(topic, topics) {
        for (var i = 0; i < topics.length; ++i) {
            if (topic.keyword === topics[i].keyword) {
                return getTopicWeight(topic) * getTopicWeight(topics[i]);
            }
        }
        return 0;
    }

    function doComputeScore(response_topics, topics) {
        var base_topics = topics.map(extractTopic);
        var score = 0;
        for (var i = 0; i < response_topics.length; ++i) {
            score += computeTopicScore(extractTopic(response_topics[i]), base_topics);
        }
        return score;
    }

    function stateNeedIsMet(id, responder, world) {
        var state = world.getState(id, responder || "");
        return state && !(state <= 0.5);
    }

    function responseNeedsAreMet(response, responder, world) {
        if (response.needs) {
            for (var i = 0; i < response.needs.length; ++i) {
                if (!stateNeedIsMet(response.needs[i], responder, world)) {
                    return false;
                }
            }
        }
        return true;
    }

    core.computeScore = function(response, topics, responder, world) {
        var response_topics = response.matches;
        var score = (!response_topics || response_topics.length === 0) ? 1 : doComputeScore(response_topics, topics);
        if (response.weights !== undefined)
            score *= world.getState(response.weights, responder);
        return score;
    };

    core.responseIsEligible = function(response, topics, responder, world) {
        return responseCountValid(response, world) &&
            responseNeedsAreMet(response, responder, world) &&
            responseRequiredTopicsAreDefined(response, topics) &&
            this.computeScore(response, topics, responder, world) > 0;
    };

    function addIfHasScore(response, topics, candidates, responder, world) {
        var score = core.computeScore(response, topics, responder, world);
        if (score > 0) {
            candidates.push({response: response, score: score, responder: responder});
        }
    }

    function addResponse(response, topics, candidates, responder, world) {
        if (core.responseIsEligible(response, topics, responder, world)) {
            if (response.selects !== undefined) {
                addResponses(response.selects, topics, candidates, responder, world);
            } else {
                addIfHasScore(response, topics, candidates, responder, world);
            }
        }
    }

    function addResponses(responses, topics, candidates, responder, world) {
        var boundAdd = function (response) { addResponse(response, topics, candidates, responder, world); };
        responses.forEach(boundAdd);
        return candidates;
    }

    core.selectResponses = function(responses, topics, responder, world) {
        return addResponses(responses, topics, [], responder, world);
    };

    core.groupCandidates = function(candidates) {
        var candidate_groups =  {
            groups: {},
            prompts: []
        };
        candidates.forEach(function (candidate) {
            if (candidate.response.prompts) {
                candidate_groups.prompts.push(candidate);
            } else {
                var type = candidate.response.is || "general";
                if (!candidate_groups.groups[type]) {
                    candidate_groups.groups[type] = [];
                }
                candidate_groups.groups[type].push(candidate);
            }
        });
        return candidate_groups;
    };

    core.convertTopics = function(topics) {
        if (topics === '') {
            return [];
        }
        return topics.split(' ').map(function(value) { return {keyword: value, weight: 1.0} });
    };

    function addResponseReferences(responses, new_responses, rif) {
        if (!responses) {
            return;
        }
        $.each(responses, function(index, value) {
            if (value.reference) {
                addResponseReferences(rif.responses[value.reference], new_responses, rif);
            } else {
                new_responses.push(value);
            }
        });
    }

    core.expandResponseReferences = function(responses, rif) {
        var new_responses = [];
        addResponseReferences(responses, new_responses, rif);
        return new_responses;
    };

    core.getResponsesForResponders = function(responders, rif) {
        if (!rif.responses)
            return {};
        var responses = {};
        $.each(responders, function (index, value) {
            if (rif.responses[value])
                responses[value] = rifResponseCore.expandResponseReferences(rif.responses[value], rif);
        });
        return responses;
    };

    return core;
});
