var RifInteract = (function() {
    "use strict";
    
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
                var original_color = target.css("color");
                target.animate({color: "#c0c000"}, 250).animate({color: original_color}, 300);
                self.sendCommand(keywords.split(" "));
            };
        };
    };

    function convertTopics(topics) {
        return topics.map(function(value) { return {keyword: value} });
    }

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

    function replaceCallMarkup(text) {
        var incoming_context = this.says_context;
        var says_context = incoming_context || { output_string: ""};

        while (text !== "") {
            var index = text.indexOf("{+");
            if (index === -1) {
                break;
            }
            var end_index = text.indexOf("+}", index+2);
            var topics = text.substring(index+2, end_index);
            says_context.output_string += text.substring(0, index);
            this.says_context = says_context;
            this.call(topics.split(" "));
            text = text.substring(end_index+2);
        }
        says_context.output_string += text;
        if (incoming_context === undefined) {
            text = says_context.output_string;
        } else {
            text = null;
        }

        this.says_context = incoming_context;
        return text;
    }

    function outputFormattedText(says, formatted) {
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
    }

    type.prototype = {
        getNextId: function() {
            return "outputdiv" + this.id++;
        },
        say: function (says, response) {
            var text = replaceMarkup(says.text, "", this.world);
            text = replaceCallMarkup.call(this, text);
            if (text === null) {
                // recursive call return
                return;
            }
            var formatted = this.formatter.formatOutput(text, this.clickFactory);
            outputFormattedText.call(this, says, formatted);
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
            var clickfactory = function(i) {
                return function() {
                    self.hideSections();
                    callback(i);
                };
            };
            this.showAutoHideText(this.formatter.formatMenu(options, clickfactory));
            //var says = { text: this.formatter.formatMenu(options, clickfactory), autohides: true};
            //this.say(says);
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
        call: function(topics) {
            this.callTopics(topics);
        },
        callTopics: function(topics) {
            topics = convertTopics(topics);
            var responses = {};
            var caller = this.world.getPOV();
            var self = this;
            $.each(this.world.getCurrentResponders(caller), function(index, value) {
                responses[value] = self.expandResponseReferences(self.rif.responses[value]);
            });
            this.response_lib.callTopics(responses, topics, caller, this);
        },
        callActions: function(topics) {
            //console.log("callActions");
            topics = convertTopics(topics);
            var actions = this.rif.actions;
            for (var actor in actions) {
                if (actions.hasOwnProperty(actor)) {
                    var responses = {};
                    responses[actor] = actions[actor];
                    //console.log("call actions for ", actor);
                    //console.info(responses);
                    this.response_lib.callTopics(responses, topics, actor, this);
                }
            }
        },
        animate: function(animates) {
            var self = this;
            $.each(animates.transitions, function(index, transition) {
                self.dom.animate(animates.selector, transition.to, transition.lasting);
            });
        },
        invoke: function(body) {
            var f = new Function(body);
            f();
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
            this.callTopics(topics);
            this.idleProcessing();
        },
        hideSeparator: function () {
            if (this.separatorShown) {
                //console.log("hideSeparator " + this.separatorShown)
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
            //console.log("show new separator " + this.separatorShown);
        },
        showSeparator: function () {
            if (this.separatorShown) {
                //console.log("show separator " + this.separatorShown);
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
        }
    };
    return type;
}());
