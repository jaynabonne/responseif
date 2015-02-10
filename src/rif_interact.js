var RifInteract = (function() {
    "use strict";
    
    var type = function (dom, formatter, world) {
        this.id = 1;
        this.dom = dom;
        this.formatter = formatter;
        this._appendNewDiv();
        this.world = world;
        this.sectionsToHide = [];
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

    type.prototype = {
        getNextId: function() {
            return "outputdiv" + this.id++;
        },
        getState: function(id, responder) {
            return this.world.getState(id);
        },
        setState: function(id, responder) {
            this.world.setState(id);
        },
        setParent: function(object, parent) {
            this.world.setParent(object, parent);
        },
        say: function (says, response) {
            var formatted = this.formatter.formatOutput(says.text, this.clickFactory);
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
            }
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
        },
        beginSection: function(id) {
            this._appendNewDiv(id);
        },
        endSection: function() {
            this._appendNewDiv();
        },
        hideSection: function(id) {
            this.dom.hideElement('#'+id, 250);
        },
        _appendNewDiv: function(id) {
            var div = this.dom.createDiv(id);
            this.dom.append(div);
            this.currentDiv = div;
        },
        call: function(topics) {
            this.world.callTopics(topics);
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
            this.world.callTopics(topics);
        }
    };
    return type;
}());
