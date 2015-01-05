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
        say: function (text, response) {
            text = text.replace(/{break}/g, breaktext);
            this.currentDiv.append(this.formatter.formatOutput(text, this.keywordClickFactory));
            this.dom.scrollToEnd();
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
            var section = dom.getElementById(id);
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
