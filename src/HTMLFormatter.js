var HTMLFormatter = (function () {
    
    var type = function () {
    };

    function createClickable(type, text, cssClass, click) {
        return $("<" + type + ">", {class: cssClass}).text(text).click(click);
    }
    
    type.prototype = {
        formatOutput: function(text, clickfactory) {
            var span = $("<span>");
            var index;
            while ((index = text.indexOf("{!")) >= 0) {
                var endIndex = text.indexOf("!}");
                var keyword = text.substring(index+2, endIndex);
                span.append(text.substring(0, index));
                var clickable = createClickable("span", keyword, 'keyword', clickfactory(keyword));
                span.append(clickable);
                text = text.substring(endIndex+2);
            }
            span.append(text);
            return span;
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
