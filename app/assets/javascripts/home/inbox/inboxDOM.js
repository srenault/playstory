/**
 * inboxDOM.js
 */

(function(Inbox) {

     Inbox.InboxDOM = function() {
         console.log("[Inbox.DOM] Init Inbox DOM");

         //DOM elements
         var elts = new (function() {
             this.$inbox = $('.inbox');
             this.$levels = this.$inbox.find('ul li');
         })();

         //Events
         this.onAllClick = function(next) {
             console.log("Select all feed");
         };

         this.initCounters = Action(function(data, next) {
             elts.$inbox.find('li.' + data.counter.level + ' a span')
             .text('('+ data.counter.count + ')');
         });

         this.updateCounters = Action(function(counters, next) {
             console.log(counters);
         });

         this.refreshNavigation = Action(function(params, next) {
             elts.$levels.each(function(index, level) {
                 var $level = $(level),
                     levelStr = $level.attr('class');

                 if(levelStr) {
                     var uri = ('#past/:project/level/' + levelStr).replace(':project', params[0]);
                     $level.find('a').attr('href', uri);
                 }
             });
             next(params);
         });
     };

 })(window.PlayStory.Init.Home.Inbox);