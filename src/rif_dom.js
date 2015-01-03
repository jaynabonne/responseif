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

    return type;
})();
