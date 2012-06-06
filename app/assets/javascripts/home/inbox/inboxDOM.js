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

         this.updateAllCounter = Action(function(evt, next) {
             console.log("update all counter");
         });
     };

 })(window.PlayStory.Init.Home.Inbox);