/**
 * Router.js
 */

window.PlayStory = {
    Init: {
        Home: {
            Tabs: {},
            Feeds : {
                FeedsPast: {},
                FeedsPresent: {}
            },
            Inbox : {}
        },
        Models: {
        }
    }
};

(function(PlayStory) {

     PlayStory.Router = (function() {
         console.log("[PlayStory.Router] Init play story router");

         //Events
         var onRouteChange = function(next) {
             window.addEventListener('hashchange', next);
         };

         //Interactions
         var router = When(onRouteChange)
         .map(function(evt) {
            return evt.newURL.split('#')[1];
         });

         //Utils
         var currentRoute = function() {
             return window.location.hash.substr(1,window.location.hash.length);
         };

         var BackboneRegex = (function() {
             var namedParam    = /:\w+/g,
                 splatParam    = /\*\w+/g,
                 escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

             return {
                 routeToRegExp: function(route) {
                     route = route.replace(escapeRegExp, '\\$&')
                                  .replace(namedParam, '([^\/]+)')
                                  .replace(splatParam, '(.*?)');

                     return new RegExp('^' + route + '$');
                 },

                 extractParams: function(routeRegex) {
                     return routeRegex.exec(currentRoute()).slice(1);
                 }
             };
         })();

         //Actions
         var extractParams = function(routeRegex) {
             return Action(function(route, next) {
                 var params= BackboneRegex.extractParams(routeRegex);
                 next(params);
             });
         };

         return {
             when: function(route, newAction) {
                 var routeRegex = BackboneRegex.routeToRegExp(route);
                 var r = Match.regex(routeRegex, extractParams(routeRegex).then(newAction));
                 router.match(r).subscribe();

                 if(routeRegex.test(currentRoute())) {
                     var params = BackboneRegex.extractParams(routeRegex);
                     newAction._do(params);
                 }
             },

             go: function(route) {
                 history.pushState({}, route, "#" + route);
             },
             currentRoute: currentRoute
         };
     })();

 })(window.PlayStory || {});