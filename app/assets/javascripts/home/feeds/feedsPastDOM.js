/**
 * feedsPastDOM.js
 */

(function(Feeds) {

     Feeds.FeedsPastDOM = function() {
         console.log("[FeedsPast.DOM] Init feeds past DOM");

         //DOM elements
         var elts = new (function() {
             this.$feeds = $('.feeds.past');
             this.$moreFeeds = this.$feeds.find('.more-feeds');
             this.$counter = this.$moreFeeds.find('.counter');
         })();

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

         this.updateCounter = Action(function(evt, next) {
             var current = parseInt(elts.$counter.text());
             if(isNaN(current)) current = 0;
             elts.$counter.text(current+1);
             elts.$moreFeeds.show();
         });

         this.viewFeeds = Action(function(evt, next) {
             elts.$feeds.show();
             next(evt);
         });

         this.hideFeeds = Action(function(evt, next) {
             elts.$feeds.hide();
             next(evt);
         });

         this.addNewFeeds = Action(function(evt, next) {
             console.log("sfsdf");
         });
     };

 })(window.PlayStory.Init.Home.Feeds);