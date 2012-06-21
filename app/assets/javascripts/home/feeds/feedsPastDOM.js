/**
 * feedsPastDOM.js
 */

(function(Feeds) {

     Feeds.FeedsPastDOM = function() {
         console.log("[FeedsPast.DOM] Init feeds past DOM");

         //DOM elements
         var elts = new (function() {
             this.$feedsContainer = $('.feeds.past');
             this.$feedsList = $('.feeds.past ul');
             this.$moreFeeds = this.$feedsContainer.find('.more-feeds');
             this.$counter = this.$moreFeeds.find('.counter');
         })();

         var feedTmpl = _.template($("#feed_tmpl").html());
         var commentTmpl = _.template($("#comment_tmpl").html());

         //Events
         this.onMoreFeedsClick = function(next) {
             elts.$moreFeeds.click(next);
         };

         this.onNewCommentClick = function(next) {
             elts.$feedsContainer.on('click', 'a.comment', next);
         };

         this.onSubmitCommentClick = function(next) {
             elts.$feedsContainer.on('click', '.comments button.save', next);
         };

         //Actions
         this.clearFeeds = Action(function(evt, next) {
             elts.$feedsList.empty();
             next(evt);
         });

         this.displayNewComment = Action(function(evt, next) {
             var $feed = $(evt.currentTarget).closest('.log')
                                             .find('.comments');
             $feed.append(commentTmpl({}));
             $feed.show();
             next(evt);
         });

         this.fifo = Action(function(fifo, next) {
             elts.$feedsList.prepend(feedTmpl({
                 feed: fifo.newFeed
             }));

             if(fifo.isFull) {
                 elts.$feedsList.find('li:last').remove();
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
             elts.$feedsContainer.show();
             next(evt);
         });

         this.hideFeeds = Action(function(evt, next) {
             elts.$feedsContainer.hide();
             next(evt);
         });

         this.addFeeds = Action(function(feeds, next) {
             feeds.forEach(function(feed) {
                 elts.$feedsList.prepend(feedTmpl({
                     feed: feed
                 }));
             });
         });
     };

 })(window.PlayStory.Init.Home.Feeds);