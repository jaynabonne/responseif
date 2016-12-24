define(['./verb'], function(rifVerb) {
    "use strict";

    function expandCallMarkup(text, css_class, calltopics, caller) {
        this.begin(css_class);
        while (text !== "") {
            var index = text.indexOf("{+");
            if (index === -1) {
                break;
            }
            var end_index = text.indexOf("+}", index + 2);
            var topics = text.substring(index + 2, end_index);
            this.append(text.substring(0, index));
            calltopics(topics, caller);
            text = text.substring(end_index + 2);
        }
        this.append(text);
        this.end();
    }

    function appendNewDiv(id) {
        var div = this.dom.createDiv(id);
        this.dom.append(div);
        this.currentDiv = div;
    }

    var type = function(formatter, helper, dom, world) {
        this.formatter = formatter;
        this.helper = helper;
        this.dom = dom;
        this.world = world;
        this.links = [];
        this.contexts = [];
        this.sectionsToHide = [];
        this.id = 1;

        appendNewDiv.call(this);

        this.separator = {
            needed: false,
            id: 0,
            shownSelector: "",
            update: function () {
                if (this.needed) {
                    this.hide();
                    this.showNew();
                    this.needed = false;
                }
            },
            hide: function () {
                if (this.shownSelector) {
                    this.dom.removeElement(this.shownSelector, 1);
                    this.shownSelector = "";
                }
            },
            showNew: function () {
                var separatorId = "separator" + this.id++;
                var div = this.dom.createDiv();
                div.append("<div class='separatorholder'><div class='separator' style='display:none' id='" + separatorId + "'></div></div>");
                this.dom.append(div);
                this.shownSelector = '#'+separatorId;
            },
            show: function () {
                if (this.shownSelector && this.world.getState('show_separator:')) {
                    this.dom.showElement(this.shownSelector);
                }
            },
            world: world,
            dom: dom
        };
    };

    function writeToNewSection(formatted) {
        var id = "outputdiv" + this.id++;
        this.beginSection(id);
        this.currentDiv.append(formatted);
        this.endSection();
        return id;
    }

    function pushContext() {
        var context = this.contexts.length === 0 ? this.formatter.createContext() : this.contexts[0];
        context.expandCallMarkup = expandCallMarkup;

        this.contexts.push(context);
        return context;
    }

    function expandVerbs(text, world, responder) {
        var index;
        while ((index = text.indexOf("{<")) != -1) {
            var end_index = text.indexOf(">}", index + 2);
            if (end_index === -1) {
                break;
            }

            var verb = text.substring(index+2, end_index).trim();

            var verb_flags = (responder === world.getPOV()) ? 'sPs' : 'tPs';        // hard-coded for now
            var conjugated = rifVerb.get(verb).conjugate(verb_flags);

            text = text.substring(0, index) + conjugated + text.substring(end_index+2);
        }

        return text;
    }

    function popContext(says, responder) {
        var context = this.contexts.pop();
        if (this.contexts.length === 0) {
            var formatted = this.formatter.formatOutput(context.getOutputText(), this.helper.createClick, context.menu_callbacks, says.as);

            var self = this;

            $.each(formatted.links, function(index, link) {
                self.links.push({responder: responder, selector: link.selector, keywords: link.keywords});
            });

            outputFormattedText.call(this, says, formatted.node);
        }
    }

    function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
    }

    function getResponderValue(world, responder, id) {
        var value = world.getState('alias', responder);
        if (value === undefined) {
            value = (responder === world.getPOV()) ? 'you' : responder;
        }
        if (id === '$Responder') {
            value = capitalize(value);
        } else if (id === '$RESPONDER') {
            value = value.toUpperCase();
        }
        return value;
    }

    function replaceMarkup(text, responder, world) {
        var index;
        while ((index = text.indexOf("{=")) != -1) {
            var end_index = text.indexOf("=}", index+2);
            if (end_index === -1) {
                break;
            }
            var id = text.substring(index+2, end_index).trim();
            var value;
            if (id.toLowerCase() === '$responder') {
                value = getResponderValue(world, responder, id);
            } else {
                value = world.getState(id, responder);
            }
            text = text.substring(0, index) + value + text.substring(end_index+2);
        }
        return expandVerbs(text, world, responder);
    }

    function outputFormattedText(says, formatted) {
        if (says.into) {
            this.dom.setText(says.into, formatted);
        } else if (says.onto) {
            this.dom.appendText(says.onto, formatted);
        } else {
            if (says.autohides) {
                this.showAutoHideText(formatted);
            } else {
                this.currentDiv.append(formatted);
                this.currentDiv.append(" ");
                this.dom.scrollToEnd();
            }
            this.separator.show();
            this.separator.needed = true;
        }
    }

    type.prototype.say = function(says, responder, caller) {
        var text = replaceMarkup.call(this, says.text, responder, this.world);

        var context = pushContext.call(this);
        context.expandCallMarkup(text, says.as, this.helper.callTopicString, caller);
        popContext.call(this, says, responder);
    };

    type.prototype.choose = function(options, click_callback) {
        var context = pushContext.call(this);

        var menu_index = context.addMenuCallback(click_callback);

        var says = { text: this.formatter.formatMenu(options, menu_index), autohides: true};
        this.say(says);

        popContext.call(this, says, '');
    };

    type.prototype.showAutoHideText = function (formatted) {
        var id = writeToNewSection.call(this, formatted);
        this.sectionsToHide.push(id);
        this.dom.scrollToEnd();
    };

    type.prototype.beginSection = function(id) {
        appendNewDiv.call(this, id);
    };
    type.prototype.endSection = function() {
        appendNewDiv.call(this);
    };
    type.prototype.hideSection = function(id) {
        this.dom.removeElement('#'+id, 250);
    };
    type.prototype.hideSections = function () {
        if (this.sectionsToHide.length != 0) {
            var self = this;
            $.each(this.sectionsToHide, function (index, value) {
                self.hideSection(value);
            });
            this.sectionsToHide = [];
        }
    };

    type.prototype.clear = function() {
        this.hideSections();
        this.dom.clear();
        appendNewDiv.call(this);
        this.links = [];
    };

    type.prototype.animate = function(animates) {
        var self = this;
        $.each(animates.transitions, function(index, transition) {
            self.dom.animate(animates.selector, transition.to, transition.lasting);
        });
    };

    type.prototype.removeDeadLinks = function () {
        var dom = this.dom;
        var checkTopics = this.helper.getTopicChecker();

        this.links = this.links.filter(function (link) {
            if (!checkTopics(link.keywords)) {
                dom.removeClass(link.selector, 'keyword');
                dom.removeEvent(link.selector, 'click');
                return false;
            }
            return true;
        });
    };
    type.prototype.beforeCommand =  function() {
        this.hideSections();
        this.separator.update();
        this.beginSection();
    };
    type.prototype.afterCommand = function() {
        this.removeDeadLinks();
    };

    return type;
});

