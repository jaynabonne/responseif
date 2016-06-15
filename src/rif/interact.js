define(['./topic_strategy'], function(RifTopicStrategy) {
    "use strict";

    function convertTopics(topics) {
        return topics.map(function(value) { return {keyword: value, weight: 1.0} });
    }

    var type = function (dom, formatter, world, response_lib, rif) {
        this.id = 1;
        this.dom = dom;
        this.formatter = formatter;
        this._appendNewDiv();
        this.world = world;
        this.response_lib = response_lib;
        this.sectionsToHide = [];
        this.rif = rif;
        this.needsSeparator = false;
        this.separatorId = 0;
        this.separatorShown = "";
        var self = this;
        this.clickFactory = function (keywords) {
            return function (e) {
                var target = $(e.target);
                if (rif.clickEffect !== undefined) {
                    $.each(rif.clickEffect.transitions, function(index, transition) {
                        self.dom.animate(target, transition.to, transition.lasting);
                    });
                }
                self.sendCommand(convertTopics(keywords.split(" ")));
            };
        };
        this.links = [];
        this.resetMenuCallbacks();
    };

    function replaceMarkup(text, responder, world) {
        var index;
        while ((index = text.indexOf("{=")) != -1) {
            var end_index = text.indexOf("=}", index+2);
            if (end_index === -1) {
                break;
            }
            var id = text.substring(index+2, end_index);
            var value = world.getState(id.trim(), responder);
            text = text.substring(0, index) + value + text.substring(end_index+2);
        }
        return text;
    }

    function expandCallMarkup(text, context) {
        while (text !== "") {
            var index = text.indexOf("{+");
            if (index === -1) {
                break;
            }
            var end_index = text.indexOf("+}", index + 2);
            var topics = text.substring(index + 2, end_index);
            context.append(text.substring(0, index));
            context.callTopics(topics);
            text = text.substring(end_index + 2);
        }
        context.append(text);
    }

    function createCallContext(interact) {
        return {
            output_string: "",
            append: function(text) {
                this.output_string += text;
            },
            callTopics: function(topics) {
                interact.callTopicString(topics)
            },
            getOutputText: function() {
                return this.output_string;
            }
        };
    }

    function expandAndFormatOutput(text, says) {
        var incoming_context = this.says_context;
        var context = incoming_context || createCallContext(this);

        this.says_context = context;

        expandCallMarkup(text, context);

        this.says_context = incoming_context;

        if (incoming_context !== undefined) {
            return null;
        }

        return this.formatter.formatOutput(context.getOutputText(), this.clickFactory, this.menu_callbacks, says.as);
    }

    type.prototype = {
        getNextId: function() {
            return "outputdiv" + this.id++;
        },

        resetMenuCallbacks: function () {
            this.menu_index = 0;
            this.menu_callbacks = {};
        },

        outputFormattedText: function(says, formatted) {
            if (says.into) {
                var element = this.dom.getElementBySelector(says.into);
                $(element).html(formatted);
            } else {
                if (says.autohides) {
                    this.showAutoHideText(formatted);
                } else {
                    this.currentDiv.append(formatted);
                    this.currentDiv.append(" ");
                    this.dom.scrollToEnd();
                }
                this.showSeparator();
                this.needsSeparator = true;
            }
        },
        say: function (says, responder) {
            var text = replaceMarkup(says.text, responder, this.world);
            var formatted = expandAndFormatOutput.call(this, text, says);
            if (formatted === null) {
                // recursive call return
                return;
            }

            var self = this;

            $.each(formatted.links, function(index, link) {
                self.links.push({responder: responder, selector: link.selector, keywords: link.keywords});
            });

            this.outputFormattedText(says, formatted.node);
            this.resetMenuCallbacks();
        },
        showAutoHideText: function (formatted) {
            var id = this.getNextId();
            this.beginSection(id);
            this.currentDiv.append(formatted);
            this.endSection();
            this.sectionsToHide.push(id);
            this.dom.scrollToEnd();
        },
        choose: function(options, callback) {
            var self = this;
            var index = this.menu_index++;
            this.menu_callbacks[index] = function(index) {
                self.hideSections();
                callback(index);
                self.idleProcessing();
            };
            var says = { text: this.formatter.formatMenu(options, index), autohides: true};
            this.say(says);
        },
        beginSection: function(id) {
            this._appendNewDiv(id);
        },
        endSection: function() {
            this._appendNewDiv();
        },
        hideSection: function(id) {
            this.dom.removeElement('#'+id, 250);
        },
        _appendNewDiv: function(id) {
            var div = this.dom.createDiv(id);
            this.dom.append(div);
            this.currentDiv = div;
        },
        callTopicString: function(topics) {
            var index = topics.indexOf('>');
            if (index >= 0) {
                var caller = topics.substring(index+1);
                topics = topics.substring(0, index);
                this.callTopicsForCaller(this.world.getState(caller), convertTopics(topics.split(" ")));
            } else {
                this.call(convertTopics(topics.split(" ")));
            }
        },
        callTopicsForCaller: function (caller, topics) {
            var responders = this.world.getCurrentResponders(caller);
            this.callTopicsWithResponders(topics, responders, caller);
        },
        call: function(topics) {
            this.callTopicsForCaller(this.world.getPOV(), topics);
        },
        getResponses: function (responders) {
            var responses = {};
            if (!this.rif.responses)
                return responses;
            var self = this;
            $.each(responders, function (index, value) {
                if (self.rif.responses[value])
                    responses[value] = self.expandResponseReferences(self.rif.responses[value]);
            });
            return responses;
        },
        callTopicsWithResponders: function(topics, responders, caller) {
            var merged_topics = RifTopicStrategy.mergeCurrentTopics(topics, this.world.getCurrentTopics(caller));
            this.response_lib.callTopics(this.getResponses(responders), merged_topics, caller, this);
        },
        callActions: function(topics) {
            topics = convertTopics(topics);
            var actions = this.rif.actions;
            for (var actor in actions) {
                if (actions.hasOwnProperty(actor)) {
                    var responses = {};
                    responses[actor] = actions[actor];
                    var merged_topics = RifTopicStrategy.mergeCurrentTopics(topics, this.world.getCurrentTopics(actor));
                    this.response_lib.callTopics(responses, merged_topics, actor, this);
                }
            }
        },
        animate: function(animates) {
            var self = this;
            $.each(animates.transitions, function(index, transition) {
                self.dom.animate(animates.selector, transition.to, transition.lasting);
            });
        },
        invoke: function(body, responder) {
            var f = new Function('world', 'interact', 'responder', body);
            f(this.world, this, responder);
        },
        clear: function() {
            this.hideSections();
            this.dom.clear();
            this._appendNewDiv();
            this.links = [];
        },
        hideSections: function () {
            if (this.sectionsToHide.length != 0) {
                var self = this;
                $.each(this.sectionsToHide, function (index, value) {
                    self.hideSection(value);
                });
                this.sectionsToHide = [];
            }
        },
        sendCommand: function(topics) {
            this.hideSections();
            this.beforeCommand();
            this.call(topics);
            this.idleProcessing();
            this.world.updateModels();
            this.hideObsoleteLinks();
        },
        hideObsoleteLinks: function() {
            var self = this;
            var responders = this.world.getCurrentResponders(this.world.getPOV());
            var responses = this.getResponses(responders);
            this.links = this.links.filter(function(link) {
                var candidates = self.response_lib.getCandidateResponses(responses, convertTopics(link.keywords.split(' ')));
                if (candidates.length === 0) {
                    self.dom.removeClass(link.selector, 'keyword');
                    self.dom.removeEvent(link.selector, 'click');
                    return false;
                }
                return true;
            });
        },
        hideSeparator: function () {
            if (this.separatorShown) {
                this.dom.removeElement(this.separatorShown, 1);
                this.separatorShown = "";
            }
        },
        showNewSeparator: function () {
            var separator = "separator" + this.separatorId;
            var div = this.dom.createDiv();
            div.append("<div class='separatorholder'><div class='separator' style='display:none' id='" + separator + "'></div></div>");
            this.dom.append(div);
            this.separatorShown = '#'+separator;
            this.separatorId++;
        },
        showSeparator: function () {
            if (this.separatorShown && this.world.getState('show_separator')) {
                this.dom.showElement(this.separatorShown);
            }
        },
        beforeCommand: function() {
            if (this.needsSeparator) {
                this.hideSeparator();
                this.showNewSeparator();
                this.needsSeparator = false;
            }
            this.beginSection();
        },
        idleProcessing: function() {
            this.callActions(["ACT"]);
        },
        addResponseReferences : function(responses, new_responses) {
            if (!responses) {
                return;
            }
            var self = this;
            $.each(responses, function(index, value) {
                if (value.reference) {
                    self.addResponseReferences(self.rif.responses[value.reference], new_responses);
                } else {
                    new_responses.push(value);
                }
            });
        },
        expandResponseReferences: function(responses) {
            var new_responses = [];
            this.addResponseReferences(responses, new_responses);
            return new_responses;
        },
        runSetups: function() {
            var setups = this.rif.setup;
            if (!setups) {
                return;
            }
            var self = this;

            $.each(setups, function(index, setup) {
                var responders = {};
                responders[setup.responder] = setup.responses;

                self.response_lib.callTopics( responders, [], '', self );
            });
        }
    };
    return type;
});
