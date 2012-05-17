/**
 * feedsDOM.js
 */

(function(Feeds) {
     
     Feeds.FeedsDOM = function() {
         console.log("[Feeds.DOM] Init feeds DOM");

         //Subscriptions
         var subscriptions = [];
         var subscribe = function(eventName, callback) {
             subscriptions[eventName] = subscriptions[eventName] || [];
             subscriptions[eventName].push(callback);
         };

         //DOM elements
         var elts = {
             $feeds: $('.feeds ul')
         };

         //Actions
         this.createFeed = Action(function(feed, next) {
             console.log(feed);
             elts.$feeds.prepend(_.template($("#feed_tmpl").html()));
             next(feed);
         });

         this.viewFeed = Action(function(evt, next) {
             console.log('viewing feed #1');
             next(evt);
         });
     };

 })(window.PlayStory.Init.Home.Feeds || {});