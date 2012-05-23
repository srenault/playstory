/**
 * Router.js
 */

window.PlayStory = window.PlayStory || {};
window.PlayStory.Init = window.PlayStory.Init || {};
window.PlayStory.Init.Home = window.PlayStory.Init.Home || {};
window.PlayStory.Init.Home.Tabs = window.PlayStory.Init.Home.Tabs || {};
window.PlayStory.Init.Home.Feeds = window.PlayStory.Init.Home.Feeds || {};

(function(PlayStory) {

     PlayStory.Router = (function() {
         console.log("[PlayStory.Router] Init play story router");

         var currentHash = function() {
             return window.location.hash.substr(1,window.location.hash.length);
         };

         var onRouteChange = function(next) {
             window.addEventListener('hashchange', next);
         };

         var router = When(onRouteChange)
         .map(function(evt) {
            return evt.newURL.split('#')[1];
         });

         var routes = [];

         //Init
         (function() {
             if(currentHash() == '') {
                 history.pushState({},"present", "#past");
             }
         }());

         return {
             put: function(route, newAction) {
                 var r = Match.value(route, newAction);
                 router.match(r).subscribe();

                 var actions = routes[route];
                 actions = actions || [];
                 actions.push(newAction);
                 routes[route] = actions;

                 if(currentHash() == route) newAction._do();
             }
         };
     })();

 })(window.PlayStory || {});