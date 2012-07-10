/**
 * inboxDOM.js
 */

(function(Inbox) {

     Inbox.InboxDOM = function() {
         console.log("[Inbox.DOM] Init Inbox DOM");

         //DOM elements
         var elts = new (function() {
             this.$inbox = $('.inbox');
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
             console.log(">>>>>>> inbox");
             console.log(counters);
         });
     };

 })(window.PlayStory.Init.Home.Inbox);