var RifDOM = (function(formatter) {
    "use strict";
    var type = function() {
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

    return type;
})();
