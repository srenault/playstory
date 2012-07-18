/**
 * appsDOM.js
 */

(function(Apps) {

     Apps.AppsDOM = function() {
         console.log("[Inbox.DOM] Init Apps DOM");

         //DOM elements
         var elts = new (function() {
             this.$apps = $('.apps');
             this.$projects = this.$apps.find('ul li.project');
         })();

         this.refreshNavigation = function(pastOrPresent) {
             return Action(function(any, next) {
                 elts.$projects.find('a').each(function(index, elt) {
                     var project = $(elt).attr('href').split('/')[1],
                         uri = ('#:tabs/:project').replace(':tabs', pastOrPresent)
                                                  .replace(':project', project);
                     $(elt).attr('href', uri);
                 });
                 next(any);
             });
         };
     };

 })(window.PlayStory.Init.Home.Apps);