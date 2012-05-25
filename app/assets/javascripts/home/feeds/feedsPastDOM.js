/**
 * feedsPastDOM.js
 */

(function(Feeds) {

     Feeds.FeedsPastDOM = function() {
         console.log("[FeedsPast.DOM] Init feeds past DOM");

         //DOM elements
         var elts = {
             $feeds: $('.feeds.past'),
             $moreFeeds: $('.feeds.past .more-feeds')
         };

         var template = _.template($("#feed_tmpl").html());

         //Events
         this.onMoreFeedsClick = function(next) {
             elts.$moreFeeds.click(next);
         };

         //Actions
         this.showError = Action(function(evt, next) {
             alert('Error');
             next(evt);
         });

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