define([], function() {
    "use strict";
    var type = function(output) {
        this.output = output;
    };

    var prototype = type.prototype;
    prototype.createDiv = function(id) {
        if (id) {
            return $('<div>', {id: id, class: 'section' });
        } else {
            return $('<div>', {class: 'section'});
        }
    };

    function scrollOutput(div) {
        var height = div.height();
        var scroll_height = div[0].scrollHeight;
        div.stop().animate({scrollTop: scroll_height - height}, 100);
    }

    function scrollPage() {
        var scrollTo = $(document).height();
        var currentScrollTop = Math.max($("body").scrollTop(), $("html").scrollTop());
        if (scrollTo > currentScrollTop) {
            var maxScrollTop = $(document).height() - $(window).height();
            if (scrollTo > maxScrollTop) scrollTo = maxScrollTop;
            $("body,html").stop().animate({scrollTop: scrollTo}, 100);
        }
    }

    prototype.scrollToEnd = function() {
        if (this.output.css('overflow-y') === 'scroll') {
            scrollOutput(this.output);
        } else {
            scrollPage();
        }
    };

    prototype.append = function(div) {
        this.output.append(div);
    };

    prototype.getElementBySelector = function(selector) {
        return $(selector);
    };

    prototype.showElement = function(selector) {
        $(selector).show();
    };

    prototype.hideElement = function(selector) {
        $(selector).hide();
    };

    prototype.removeElement = function(selector, timeout) {
        var section = this.getElementBySelector(selector);
        if (section) {
            section.hide(timeout, function () { $(this).remove(); });
        }
    };

    prototype.animate = function(selector, options, duration) {
        if (!options) {
            console.log("no options specified");
            return;
        }
        var parameters = JSON.parse(options);
        if (!parameters) {
            console.log("options: '" + options + "' are invalid JSON");
            return;
        }
        var element = selector;
        if (typeof selector === 'string') {
            element = $(selector);
        }
        if (!element) {
            console.log("no element for " + selector);
            return;
        }
        element.animate(parameters, duration || 0);
    };

    prototype.removeClass = function(selector, className) {
        $(selector).removeClass(className);
    };

    prototype.removeEvent = function(selector, event_name) {
        $(selector).off(event_name);
    };

    prototype.clear = function() {
        this.output.empty();
    };

    prototype.setText = function(selector, formatted) {
        var element = this.getElementBySelector(selector);
        $(element).html(formatted);
    };

    prototype.appendText = function(selector, formatted) {
        var element = this.getElementBySelector(selector);
        $(element).append(formatted);
    };

    return type;
});
