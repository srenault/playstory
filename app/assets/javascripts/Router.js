/**
 * Router.js
 */

window.PlayStory = window.PlayStory || {};
window.PlayStory.Init = window.PlayStory.Init || {};
window.PlayStory.Init.Home = window.PlayStory.Init.Home || {};
window.PlayStory.Init.Home.Feeds = window.PlayStory.Init.Home.Feeds || {};

(function(PlayStory) {

     PlayStory.Router = (function() {
         console.log("[Home.HomeRouter] Init Home router");

         var onRouteChange = function(next) { 
             window.addEventListener('hashchange', next);
         };

         var router = When(onRouteChange)
         .map(function(evt) {
            return evt.newURL.split('#')[1];
         });

         return {
             put: function(routeName, action, dftAction) {
                 var route = Match.value(routeName, action);
                 if(dftAction) route.dft(dftAction);
                 router.match(route).subscribe();
             }
         };
     })();

 })(window.PlayStory || {});