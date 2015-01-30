var HTMLFormatter = (function () {
    
    var type = function () {
    };

    function createClickable(type, text, cssClass, click) {
        return $("<" + type + ">", {class: cssClass}).text(text).click(click);
    }
    
    type.prototype = {
        formatOutput: function(text, clickfactory) {

            text = text
                    .replace(/\{!/g, "<span class='keyword'>")
                    .replace(/!\}/g, "</span>");

            var div = $("<div>");
            div.append(text);
            var clickspans = div.find(".keyword");
            clickspans.each( function(id, span) {
                var keyword = span.innerHTML;
                var subindex = keyword.indexOf("|");
                if (subindex >= 0) {
                    span.innerHTML = keyword.substring(0, subindex);
                    keyword = keyword.substring(subindex+1);
                }
                $(span).click(clickfactory(keyword));
            });
            return div;
        },

        formatMenu: function(options, clickfactory) {
            var span = $("<div>");
            for (var i = 0; i < options.length; ++i) {
                span.append(createClickable("div", options[i], 'menuitem', clickfactory(i)));
            }
            return span;
        }
    };
    return type;
}());
