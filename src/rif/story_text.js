define([], function() {
    "use strict";

    function expandCallMarkup(text, css_class, calltopics) {
        this.begin(css_class);
        while (text !== "") {
            var index = text.indexOf("{+");
            if (index === -1) {
                break;
            }
            var end_index = text.indexOf("+}", index + 2);
            var topics = text.substring(index + 2, end_index);
            this.append(text.substring(0, index));
            calltopics(topics);
            text = text.substring(end_index + 2);
        }
        this.append(text);
        this.end();
    }

    var type = function(formatter, clickFactory, dom, world) {
        this.formatter = formatter;
        this.clickFactory = clickFactory;
        this.dom = dom;
        this.world = world;
        this.needsSeparator = false;
        this.separatorId = 0;
        this.separatorShown = "";
        this.links = [];
        this.contexts = [];
        this.sectionsToHide = [];
        this.id = 1;

        this._appendNewDiv();
    };

    type.prototype = {
        getNextId: function() {
            return "outputdiv" + this.id++;
        },

        showAutoHideText: function (formatted) {
            var id = this.getNextId();
            this.beginSection(id);
            this.currentDiv.append(formatted);
            this.endSection();
            this.sectionsToHide.push(id);
            this.dom.scrollToEnd();
        },

        replaceMarkup: function(text, responder, world) {
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
        },
        outputFormattedText: function(says, formatted) {
            var element;
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
                this.showSeparator();
                this.needsSeparator = true;
            }
        },
        push_context: function() {
            var context = this.contexts.length === 0 ? this.formatter.createContext() : this.contexts[0];
            context.expandCallMarkup = expandCallMarkup;

            this.contexts.push(context);
            return context;
        },
        pop_context: function(says, responder) {
            var context = this.contexts.pop();
            if (this.contexts.length === 0) {
                var formatted = this.formatter.formatOutput(context.getOutputText(), this.clickFactory, context.menu_callbacks, says.as);

                var self = this;

                $.each(formatted.links, function(index, link) {
                    self.links.push({responder: responder, selector: link.selector, keywords: link.keywords});
                });

                this.outputFormattedText(says, formatted.node);
            }
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
        hideSections: function () {
            if (this.sectionsToHide.length != 0) {
                var self = this;
                $.each(this.sectionsToHide, function (index, value) {
                    self.hideSection(value);
                });
                this.sectionsToHide = [];
            }
        },
        clear: function() {
            this.hideSections();
            this.dom.clear();
            this._appendNewDiv();
            this.links = [];
        },
        animate: function(animates) {
            var self = this;
            $.each(animates.transitions, function(index, transition) {
                self.dom.animate(animates.selector, transition.to, transition.lasting);
            });
        },
        filterLinks: function(filter_function) {
            this.links = this.links.filter(filter_function);
        },
        beforeCommand: function() {
            if (this.needsSeparator) {
                this.hideSeparator();
                this.showNewSeparator();
                this.needsSeparator = false;
            }
            this.beginSection();
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
            if (this.separatorShown && this.world.getState('show_separator:')) {
                this.dom.showElement(this.separatorShown);
            }
        }
    };

    return type;
});

