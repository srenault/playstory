/**
 * feedsPastDOM.js
 */

(function(Feeds) {
     
     Feeds.FeedsPastDOM = function() {
         console.log("[FeedsPast.DOM] Init feeds past DOM");

         //DOM elements
         var elts = {
             $feeds: $('.feeds.past')
         };

         //Actions
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