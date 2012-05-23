/**
 * feedsPresentDOM.js
 */

(function(Feeds) {
     
     Feeds.FeedsPresentDOM = function() {
         console.log("[FeedsPresent.DOM] Init feeds present DOM");

         //Subscriptions
         var subscriptions = [];
         var subscribe = function(eventName, callback) {
             subscriptions[eventName] = subscriptions[eventName] || [];
             subscriptions[eventName].push(callback);
         };

         //DOM elements
         var elts = {
             $feeds: $('.feeds.present')
         };

         var template = _.template($("#feed_tmpl").html());

         //Actions
         this.fifo = Action(function(fifo, next) {
             elts.$feeds.find('ul').prepend(template({
                 feed: fifo.newFeed
             }));

             if(fifo.isFull) {
                 elts.$feeds.find('ul li:last').remove();
             }
             next(fifo);
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