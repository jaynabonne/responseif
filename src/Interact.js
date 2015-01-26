var Interact = (function() {
    "use strict";
    
    var type = function (dom, formatter, keywordClickFactory, world) {
        this.dom = dom;
        this.formatter = formatter;
        this.keywordClickFactory = keywordClickFactory;
        this._appendNewDiv();
        this.world = world;
    };

    type.prototype = {
        getState: function(id, responder) {
            return this.world.getState(id);
        },
        setState: function(id, responder) {
            this.world.setState(id);
        },
        say: function (says, response) {
            var formatted = this.formatter.formatOutput(says.text, this.keywordClickFactory);
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
            var section = this.dom.getElementBySelector('#'+id);
            if (section) {
                setTimeout(function() {
                    section.hide(250, function () { $(this).remove(); });
                }, 0);
            }
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
        }
    };
    return type;
}());
