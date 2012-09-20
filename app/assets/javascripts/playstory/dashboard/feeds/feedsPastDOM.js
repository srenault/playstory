/**
 * feedsPastDOM.js
 */

(function(PlayStory, Feeds) {

     Feeds.FeedsPastDOM = function() {
         console.log("[FeedsPast.DOM] Init feeds past DOM");
         var self = this,
             bucket = PlayStory.Bucket;

         //DOM elements
         var elts = {
             $middleColumn : function() { return $('.column-middle'); },
             $feedsContainer : function() { return $('.feeds.past'); },
             $feedsList : function() { return $('.feeds.past ul.feeds'); },
             $feeds : function() { return $('.feeds.past ul.feeds li'); },
             $moreFeeds : function() { return $('.feeds.past .more-feeds'); },
             $counter : function() { return $('.feeds.past .more-feeds .counter'); },
             findFeed : function(id) {
                 return $('.feeds.past ul #' + id);
             }
         };

         var tmpl = _.template($("#feeds_past_tmpl").html()),
             feedTmpl = _.template($("#feed_tmpl").html()),
             newCommentTmpl = _.template($("#new_comment_tmpl").html()),
             commentTmpl = _.template($("#comment_tmpl").html());

         this.render = function() {
             console.log("[Dashboard] Rendering PastDOM");
             elts.$middleColumn().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$feedsContainer().remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

         //Events
         this.onBottomPageReach = function(next) {
             window.onscroll = function() {
                 var pageHeight = document.documentElement.scrollHeight,
                     clientHeight = document.documentElement.clientHeight,
                     scrollPos = window.pageYOffset;

                 if(pageHeight - (scrollPos + clientHeight) < 70){
                     next();
                 }
             };
         };

         var preventDefault = function(callback) {
             return function(evt) {
                 evt.preventDefault();
                 callback(evt);
             };
         };

         this.onMoreFeedsClick = function(next) {
             elts.$moreFeeds().click(next);
         };

         this.onNewCommentClick = function(next) {
             elts.$feedsContainer().on('click', 'a.comment', preventDefault(next));
         };

         this.onSubmitCommentClick = function(next) {
             elts.$feedsContainer().on('click', '.comments .new.comment button.save', next);
         };

         this.onBookmarkClick = function(next) {
             elts.$feedsContainer().on('click', '.footer .bookmark', preventDefault(next));
         };

         this.onFeedClick = function(next) {
             elts.$feedsList().on('click', 'li.feed', next);
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

         this.clearFeeds = Action(function(evt, next) {
             elts.$feedsList().empty();
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
             var current = parseInt(elts.$counter().text());
             if(isNaN(current)) current = 0;
             elts.$counter().text(current+1);
             elts.$moreFeeds.show();
         });

         this.displayNewFeed = function(limit) {
             return Action(function(feed, next) {
                 elts.$feedsList().prepend(feedTmpl({
                     feed: feed,
                     commentView: function(comment) {
                         return commentTmpl({
                             author: comment.author || 'n/a',
                             message: comment.message || 'n/a'
                         });
                     }
                 }));

                 if(limit) {
                     var currentFeedsSize = elts.$feeds().length;
                     if(currentFeedsSize > limit) elts.$feedsList().find('li:last').remove();
                 }
                 next(feed);
             });
         };
     };

 })(window.PlayStory,
    window.PlayStory.Init.Dashboard.Feeds);