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

         var onRouteChange = function(next) {
             window.addEventListener('hashchange', next);
         };

         var router = When(onRouteChange)
         .map(function(evt) {
            return evt.newURL.split('#')[1];
         });

         var routes = [];

         var currentRoute = function() {
             return window.location.hash.substr(1,window.location.hash.length);
         };

         return {
             put: function(route, newAction) {
                 var r = Match.value(route, newAction);
                 router.match(r).subscribe();

                 var actions = routes[route];
                 actions = actions || [];
                 actions.push(newAction);
                 routes[route] = actions;

                 if(currentRoute() == route) newAction._do();
             },

             go: function(route) {
                 history.pushState({}, route, "#" + route);
             },

             currentRoute: currentRoute
         };
     })();

 })(window.PlayStory || {});