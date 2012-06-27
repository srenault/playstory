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

         var subscribe = function(route, actions) {
             var routeRegex = BackboneRegex.routeToRegExp(route);

             actions.unshift(extractParams(routeRegex));
             var composedActions = actions.reduce(function(prevAction, currentAction) {
                 return prevAction.then(currentAction);
             });

             var r = Match.regex(routeRegex, extractParams(routeRegex).then(composedActions));
             router.match(r).subscribe();

             if(routeRegex.test(currentRoute())) {
                 var params = BackboneRegex.extractParams(routeRegex);
                 composedActions._do(params);
             }
         };

         return new (function() {

             var that = this,
                 route = "";

             this.when = function(specifiedRoute, action) {
                 route = specifiedRoute;
                 if(action) {
                     subscribe(specifiedRoute, [action]);
                     return null;
                 } else {
                     return that;
                 }
             };

             this.go = function(route) {
                 history.pushState({}, route, "#" + route);
             };

             this.chain = function() {
                 var actions = [];
                 for(var index = 0; index<arguments.length; index++) {
                     actions.push(arguments[index]);
                 }
                 subscribe(route, actions);
                 route = route;
             };
         })();
     })();

 })(window.PlayStory || {});