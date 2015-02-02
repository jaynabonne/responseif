var Interact = (function() {
    "use strict";
    
    var type = function (dom, formatter, world) {
        this.dom = dom;
        this.formatter = formatter;
        this._appendNewDiv();
        this.world = world;
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
        getState: function(id, responder) {
            return this.world.getState(id);
        },
        setState: function(id, responder) {
            this.world.setState(id);
        },
        say: function (says, response) {
            var formatted = this.formatter.formatOutput(says.text, this.clickFactory);
            if (says.into) {
                var element = this.dom.getElementBySelector(says.into);
                $(element).html(formatted);
            } else {
                this.currentDiv.append(formatted);
                this.dom.scrollToEnd();
            }
            if (says.transition && says.transition.length) {
                $.each(says.transition, function(index, transition) {
                    if (transition === "hide") {
                        formatted.css("opacity", "0");
                    } else if (transition === "expand") {
                        formatted.css("font-size", "0%").animate({"font-size": "100%"}, 1000);
                    } else if (transition === "fadein") {
                        formatted.css("opacity", "0").animate({"opacity": "1"}, 1000);
                    }
                })
            }
        },
        choose: function(options, callback) {
            var id = "test";
            var self = this;
            var clickfactory = function(i) {
                return function() {
                    self.hideSection(id);
                    callback(i);
                };
            };

            this.beginSection(id);
            this.currentDiv.append(this.formatter.formatMenu(options, clickfactory));
            this.endSection();
            this.dom.scrollToEnd();
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
        sendCommand: function(topics) {
            this.world.callTopics(topics);
        }
    };
    return type;
}());
