/**
 * Router.js
 */

(function(PlayStory, RouterUtils) {

     PlayStory.Router = (function() {
         console.log("[PlayStory.Router] Init play story router");

         var self=this,
             subscribers = [];

         var currentRoute = function() {
             return window.location.hash.substr(1,window.location.hash.length);
         };

         var loadURL = function() {
             subscribers.forEach(function(callback) {
                 callback({
                     newURL: '#' + currentRoute()
                 });
             });
         };

         //Events
         var onRouteChange = function(next) {
             subscribers.push(next);
             window.addEventListener('hashchange', next);
         };

         //Interactions
         var router = When(onRouteChange)
         .map(function(evt) {
             return evt.newURL.split('#')[1];
         });

         //Actions
         var matchParams = function(routeAsRegex) {
             return Action(function(route, next) {
                 var params= RouterUtils.matchParams(currentRoute(), routeAsRegex);
                 next(params);
             });
         };

         var subscribe = function(route, actions) {
             var routeAsRegex = RouterUtils.routeAsRegex(route);

             actions.unshift(matchParams(routeAsRegex));
             var composedActions = actions.reduce(function(prevAction, currentAction) {
                 return prevAction.then(currentAction);
             });

             var r = Match.regex(routeAsRegex, matchParams(routeAsRegex).then(composedActions));
             router.match(r).subscribe();

             if(routeAsRegex.test(currentRoute())) {
                 var params = RouterUtils.matchParams(currentRoute(), routeAsRegex);
                 if(params) composedActions._do(params);
             }
         };

         return new (function() {
             var that = this,
                 route = null;

             this.currentRoute = currentRoute;

             this.when = function(specifiedRoute, action) {
                 route = specifiedRoute;
                 if(action) {
                     subscribe(specifiedRoute, [action]);
                     return null;
                 } else {
                     return that;
                 }
             };

             this.go = function(route, trigger) {
                 history.pushState({}, route, "#" + route);
                 if(trigger) loadURL();
             };

             this.goAsAction = function(uriPattern, buildURI, trigger) {
                 return Action(function(any, next) {
                     var uri = buildURI(uriPattern, any);
                     that.go(uri, trigger);
                     next(any);
                 });
             };

             this.chain = function() {
                 var actions = [];
                 for(var index = 0; index<arguments.length; index++) {
                     actions.push(arguments[index]);
                 }
                 subscribe(route, actions);
                 route = route;

                 return {
                     and: function() {
                         var mergedActions = [];
                         for(var index = 0; index<arguments.length; index++) {
                             mergedActions.push(arguments[index]);
                         }
                         subscribe(route, mergedActions);
                         return this;
                      }
                  };
              };

             this.isMatchCurrentRoute = function() {
                 for(var index = 0; index<arguments.length; index++) {
                     var uriPattern = arguments[index];
                     var routeAsRegex = RouterUtils.routeAsRegex(uriPattern);
                     return routeAsRegex.test(currentRoute());
                 }
             };

             this.matchCurrentRoute = function(patternURI) {
                 var routeAsRegex = RouterUtils.routeAsRegex(patternURI);
                 return RouterUtils.matchParams(currentRoute(), routeAsRegex);
             };
         })();
     })();

 })(window.PlayStory || {}, window.RouterUtils || {});