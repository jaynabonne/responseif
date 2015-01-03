var Interact = (function() {
    "use strict";
    
    var type = function (gameEngine, dom, formatter, output) {
        this.output = output;
        this.dom = dom;
        this.formatter = formatter;
        this.keywordClickFactory = function(keyword) {
            return function () {
                gameEngine.sendCommand(keyword);
            };
        };
        this._appendNewDiv();
    };
    
    var breaktext = "<div style='font-size:6pt;'><br></div>";
    
    type.prototype = {
        say: function (text, response) {
            text = text.replace(/{break}/g, breaktext);
            this.currentDiv.append(this.formatter.formatOutput(text, this.keywordClickFactory));
            this._scrollToEnd();
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
            this._scrollToEnd();
        },
        beginSection: function(id) {
            this._appendNewDiv(id);
        },
        endSection: function() {
            this._appendNewDiv();
        },
        hideSection: function(id) {
            var section = $('#'+id);
            if (section) {
                setTimeout(function() {
                    section.hide(250, function () { $(this).remove(); });
                }, 0);
            }
        },
        
        _setCurrentDiv: function(div) {
            this.output.append(div);
            this.currentDiv = div;
        },
        _appendNewDiv: function(id) {
            this._setCurrentDiv(dom.createDiv(id));
        },
        
        _scrollToEnd: function() {
            var scrollTo = $(document).height();
            var currentScrollTop = Math.max($("body").scrollTop(), $("html").scrollTop());
            if (scrollTo > currentScrollTop) {
                var maxScrollTop = $(document).height() - $(window).height();
                if (scrollTo > maxScrollTop) scrollTo = maxScrollTop;
                $("body,html").stop().animate({ scrollTop: scrollTo }, 100);
            }
        }
    };
    return type;
}());
