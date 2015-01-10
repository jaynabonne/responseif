var RifDOM = (function(formatter) {
    "use strict";
    var type = function(output) {
        this.output = output;
    };

    var prototype = type.prototype;
    prototype.createDiv = function(id) {
        if (id) {
            return $('<div>', {id: id });
        } else {
            return $('<div>');
        }
    }

    prototype.scrollToEnd = function() {
        var scrollTo = $(document).height();
        var currentScrollTop = Math.max($("body").scrollTop(), $("html").scrollTop());
        if (scrollTo > currentScrollTop) {
            var maxScrollTop = $(document).height() - $(window).height();
            if (scrollTo > maxScrollTop) scrollTo = maxScrollTop;
            $("body,html").stop().animate({ scrollTop: scrollTo }, 100);
        }
    };

    prototype.append = function(div) {
        this.output.append(div);
    };

    prototype.getElementBySelector = function(selector) {
        return $(selector);
    };

    return type;
})();
