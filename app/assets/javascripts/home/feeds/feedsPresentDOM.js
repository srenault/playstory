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
         var elts = new (function() {
             this.$feedsContainer = $('.feeds.present');
             this.$waitingFeeds = this.$feedsContainer.find('.waiting-feeds');
             this.$feedsList = $('.feeds.present ul');
         })();

         var feedTmpl = _.template($("#feed_tmpl").html()),
             commentTmpl = _.template($("#comment_tmpl").html());

         this.onFeedClick = function(next) {
             elts.$feedsList.on('click', 'li.feed', next);
         };

         this.clickedFeed = function(evt) {
             var $submitComment = $(evt.currentTarget),
                 $currentFeed = $submitComment.closest('li.feed');
             return $currentFeed;
         };

         this.displayNewFeed = function(limit) {
             return Action(function(feed, next) {
                 elts.$feedsList.prepend(feedTmpl({
                     feed: feed,
                     commentView: function(comment) {
                         return commentTmpl({
                             author: comment.author,
                             message: comment.message
                         });
                     }
                 }));

                 if(limit) {
                     var currentFeedsSize = elts.$feedsList.find('li').length;
                     if(currentFeedsSize > limit) elts.$feedsList.find('li:last').remove();
                 }
                 next(feed);
             });
         };

         this.clearFeeds = Action(function(evt, next) {
             elts.$feedsList.empty();
             next(evt);
         });

         this.displayFeedsPannel = Action(function(evt, next) {
             elts.$feedsContainer.show();
             next(evt);
         });

         this.hideFeedsPannel = Action(function(evt, next) {
             elts.$feedsContainer.hide();
             next(evt);
         });
     };

 })(window.PlayStory.Init.Home.Feeds);