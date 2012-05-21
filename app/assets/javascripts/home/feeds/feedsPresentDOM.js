/**
 * feedsPresentDOM.js
 */

(function(Feeds) {
     
     Feeds.FeedsPresentDOM = function() {
         console.log("[Feeds.DOM] Init feeds present DOM");

         //Subscriptions
         var subscriptions = [];
         var subscribe = function(eventName, callback) {
             subscriptions[eventName] = subscriptions[eventName] || [];
             subscriptions[eventName].push(callback);
         };

         //DOM elements
         var elts = {
             $feeds: $('.feeds .present')
         };

         //Actions
         this.createFeed = Action(function(feed, next) {
             console.log(feed);
             elts.$feeds.find('ul').prepend(_.template($("#feed_tmpl").html()));
             next(feed);
         });

         this.viewFeeds = Action(function(evt, next) {
             elts.$feeds.show();
             next(evt);
         });

         this.hideFeeds = Action(function(evt, next) {
             elts.$feeds.hide();
             next(evt);
         });
     };

 })(window.PlayStory.Init.Home.Feeds);