var Interact = (function() {
    "use strict";
    
    var type = function (dom, formatter, keywordClickFactory) {
        this.dom = dom;
        this.formatter = formatter;
        this.keywordClickFactory = keywordClickFactory;
        this._appendNewDiv();
    };
    
    var breaktext = "<div style='font-size:6pt;'><br></div>";
    
    type.prototype = {
        say: function (says, response) {
            var text = says.text;
            text = text.replace(/{break}/g, breaktext);
            var formatted = this.formatter.formatOutput(text, this.keywordClickFactory);
            if (says.into) {
                var element = this.dom.getElementBySelector(says.into);
                $(element).html(formatted);
            } else {
                this.currentDiv.append(formatted);
                this.dom.scrollToEnd();
            }
            if (says.transition === "fadein") {
                console.log("fadein");
                formatted.css("display", "none");
                formatted.fadeIn(1000);
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
        }
    };
    return type;
}());
