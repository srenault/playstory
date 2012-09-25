/**
 * utils.js
 */

(function() {
    window.RouterUtils = (function() {
        var namedParam    = /:\w+/g,
            splatParam    = /\*\w+/g,
            escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

        return {
            routeAsRegex: function(route) {
                route = route.replace(escapeRegExp, '\\$&')
                             .replace(namedParam, '([^\/]+)')
                             .replace(splatParam, '(.*?)');

                return new RegExp('^' + route + '$');
            },

            matchParams: function(route, routeAsRegex) {
                var params = routeAsRegex.exec(route);
                if(params) {
                    return params.slice(1);
                }
                return null;
            }
        };
    })();

    window.DOM = {
        $elt: function(selector) {
            return function() { return $(selector); };
        }
    };

    window.asAction = function(action) {
        return Action(function(any, next) {
            action(any);
            next(any);
        });
    };

    window.preventDefault = function(callback) {
        return function(evt) {
            evt.preventDefault();
            callback(evt);
        };
    };
})();
