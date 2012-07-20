/**
 * feedsPastDOM.js
 */

(function(Feeds) {

     Feeds.FeedsPastDOM = function(bucket) {
         console.log("[FeedsPast.DOM] Init feeds past DOM");

         //DOM elements
         var elts = new (function() {
             this.$feedsContainer = $('.feeds.past');
             this.$feedsList = $('.feeds.past ul');
             this.$feeds = function() { return this.$feedsList.find('li'); };
             this.$moreFeeds = this.$feedsContainer.find('.more-feeds');
             this.$counter = this.$moreFeeds.find('.counter');
             this.findFeed = function(id) {
                 return this.$feedsList.find('#' + id);
             };
         })();

         var feedTmpl = _.template($("#feed_tmpl").html()),
             newCommentTmpl = _.template($("#new_comment_tmpl").html()),
             commentTmpl = _.template($("#comment_tmpl").html());

         //Events
         this.onMoreFeedsClick = function(next) {
             elts.$moreFeeds.click(next);
         };

         this.onNewCommentClick = function(next) {
             elts.$feedsContainer.on('click', 'a.comment', next);
         };

         this.onSubmitCommentClick = function(next) {
             elts.$feedsContainer.on('click', '.comments .new.comment button.save', next);
         };

         this.onBookmarkClick = function(next) {
             elts.$feedsContainer.on('click', '.footer .bookmark', next);
         };

         this.onFeedClick = function(next) {
             elts.$feedsList.on('click', 'li.feed', next);
         };

         this.newComment = function(evt) {
             var $submitComment = $(evt.currentTarget),
                 $currentFeed = $submitComment.closest('li.feed'),
                 project = $currentFeed[0].dataset.project,
                 msg = $submitComment.closest('.comment')
                                     .find('textarea')
                                     .val();

             return {
                 $feed: $currentFeed,
                 id: $currentFeed.attr('id'),
                 msg: msg,
                 project: project
             };
         };

         this.clickedFeed = function(evt) {
             var $submitComment = $(evt.currentTarget),
                 $currentFeed = $submitComment.closest('li.feed');
             return $currentFeed;
         };

         this.newBookmark = function(evt) {
             var $bookmark = $(evt.currentTarget),
                 $currentFeed = $bookmark.closest('li.feed'),
                 project = $currentFeed[0].dataset.project,
                 id = $currentFeed.attr('id');

             return {
                 $feed: $currentFeed,
                 feed: id,
                 project: project
             };
         };

         //Actions
         this.clearFeeds = Action(function(evt, next) {
             elts.$feedsList.empty();
             next(evt);
         });

         this.displayNewComment = Action(function(evt, next) {
             var $feed = $(evt.currentTarget).closest('.log')
                     .find('.comments');
             $feed.append(newCommentTmpl({
                 author: bucket.models('user').get()
             }));
             next(evt);
         });

         this.displayComment = Action(function(comment, next) {
             comment.$feed.find('.new.comment').remove();
             comment.$feed.find('.comments').append(commentTmpl({
                 author: bucket.models('user').get(),
                 message: comment.msg
             }));
             next(comment);
         });

         this.highlightFeed = Action(function(feed, next) {
             var $feed = elts.findFeed(feed.id);
             elts.$feeds().removeClass('clicked');
             $feed.addClass('clicked');
             next(feed);
         });

         this.updateCounter = Action(function(evt, next) {
             var current = parseInt(elts.$counter.text());
             if(isNaN(current)) current = 0;
             elts.$counter.text(current+1);
             elts.$moreFeeds.show();
         });

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

                 var currentFeedsSize = elts.$feedsList.find('li').length;
                 if(currentFeedsSize > limit) elts.$feedsList.find('li:last').remove();
                 next(feed);
             });
         };
     };
 })(window.PlayStory.Init.Home.Feeds);