var HTMLFormatter = (function () {
    
    var type = function () {
    };

    function createClickable(type, text, cssClass, click) {
        return $("<" + type + ">", {class: cssClass}).html(text).click(click);
    }
    
    type.prototype = {
        formatOutput: function(text, clickfactory) {

            text = text
                    .replace(/\{!/g, "<span class='keyword'>")
                    .replace(/!\}/g, "</span>");

            var outerspan = $("<span>");
            outerspan.append(text);
            var clickspans = outerspan.find(".keyword");
            clickspans.each( function(id, span) {
                var keyword = span.innerHTML;
                var subindex = keyword.indexOf("|");
                if (subindex >= 0) {
                    span.innerHTML = keyword.substring(0, subindex);
                    keyword = keyword.substring(subindex+1);
                }
                $(span).click(clickfactory(keyword));
            });
            return outerspan;
        },

        formatMenu: function(options, clickfactory) {
            var element = $("<ul>");
            element.addClass("menu");
            for (var i = 0; i < options.length; ++i) {
                element.append(createClickable("li", options[i], 'menuitem', clickfactory(i)));
            }
            return element;
        }
    };
    return type;
}());
