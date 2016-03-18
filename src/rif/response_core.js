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

    function hasRequiredTopics(response, topics) {
        for (var i = 0; i < response.matches.length; ++i) {
            var topic = response.matches[i];
            if (isRequiredTopic(topic) && !keywordInTopics(extractTopic(topic).keyword, topics)) {
                return false;
            }
        }
        return true;
    }

    function responseRequiredTopicsAreDefined(response, topics) { return !hasTopics(response) || hasRequiredTopics(response, topics); }

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
        return topic.weight || 1;
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
        var score = 0;
        for (var i = 0; i < response_topics.length; ++i) {
            score += computeTopicScore(extractTopic(response_topics[i]), topics);
        }
        return score;
    }

    function stateNeedIsMet(id, responder, world) {
        return world.getState(id, responder || "");
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

    core.computeScore = function(response, topics) {
        var response_topics = response.matches;
        return (!response_topics || response_topics.length === 0) ? 1 : doComputeScore(response_topics, topics);
    };

    core.responseIsEligible = function(response, topics, responder, world) {
        return responseCountValid(response, world) &&
            responseNeedsAreMet(response, responder, world) &&
            responseRequiredTopicsAreDefined(response, topics) &&
            this.computeScore(response, topics) > 0;
    };

    return core;
});
