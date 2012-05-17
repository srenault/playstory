/**
 * feedsServer.js
 */

(function(Feeds) {

     Feeds.FeedsServer = function() {
         console.log("[Feeds.Server] Init feeds server");

         var subscriptions = [];
         var subscribe = function(eventName, callback) {
             subscriptions[eventName] = subscriptions[eventName] || [];
             subscriptions[eventName].push(callback);
         };

         var streamFeeds = function(feed) {
             if(EventSource) feed = JSON.parse(feed.data);
             var subscribers = subscriptions['onReceiveFeed'] || [];
             subscribers.forEach(function(s) {
                 s.apply(null, feed);
             });
         };

         return {
             onReceiveFeed: function(next) {
                 console.log("[Feeds.Server] Subscribe to feeds");
                 source = new EventSource('/story/onconnect/listen');
                 source.onmessage = streamFeeds;
                 subscribe('onReceiveFeed', next);
             }
         };
     };

 })(window.PlayStory.Init.Home.Feeds || {});