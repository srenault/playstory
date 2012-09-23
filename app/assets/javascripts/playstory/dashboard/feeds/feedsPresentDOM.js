/**
 * feedsPresentDOM.js
 */

(function(Feeds, DOM) {

     Feeds.FeedsPresentDOM = function() {
         console.log("[FeedsPresent.DOM] Init feeds present DOM");
         var self = this;

         var subscriptions = [];
         var subscribe = function(eventName, callback) {
             subscriptions[eventName] = subscriptions[eventName] || [];
             subscriptions[eventName].push(callback);
         };

         var elts = {
             $middleColumn : DOM.$elt('.column-middle'),
             $feedsContainer : DOM.$elt('.feeds.present'),
             $waitingFeeds : DOM.$elt('.feeds.present .waiting-feeds'),
             $feedsList : DOM.$elt('.feeds.present ul.logs')
         };

         var tmpl = _.template($("#feeds_present_tmpl").html()),
             feedTmpl = _.template($("#feed_tmpl").html()),
             commentTmpl = _.template($("#comment_tmpl").html());

         this.render = function() {
             console.log("[Dashboard] Rendering PresentView");
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

         this.onFeedClick = function(next) {
             elts.$feedsList().on('click', 'li.feed', next);
         };

         this.clickedFeed = function(evt) {
             var $submitComment = $(evt.currentTarget),
                 $currentFeed = $submitComment.closest('li.feed');
             return $currentFeed;
         };

         this.displayNewFeed = function(limit) {
             return Action(function(feed, next) {
                 elts.$feedsList().prepend(feedTmpl({
                     feed: feed,
                     commentView: function(comment) {
                         return commentTmpl({
                             author: comment.author,
                             message: comment.message
                         });
                     }
                 }));

                 if(limit) {
                     var currentFeedsSize = elts.$feedsList().find('li').length;
                     if(currentFeedsSize > limit) elts.$feedsList().find('li:last').remove();
                 }
                 next(feed);
             });
         };

         this.clearFeeds = Action(function(evt, next) {
             elts.$feedsList().empty();
             next(evt);
         });

         this.displayFeedsPannel = Action(function(evt, next) {
             elts.$feedsContainer().show();
             next(evt);
         });

         this.hideFeedsPannel = Action(function(evt, next) {
             elts.$feedsContainer().hide();
             next(evt);
         });
     };

 })(window.PlayStory.Init.Dashboard.Feeds, window.DOM);