/**
 * appsDOM.js
 */

(function(Apps) {

     Apps.AppsDOM = function() {
         console.log("[Inbox.DOM] Init Apps DOM");
         var self = this;

         //DOM elements
         var elts = new (function() {
             this.$rightColumn = $('.column-right');
             this.$apps = $('.apps');
             this.$projects = this.$apps.find('ul li.project');
         })();

         var tmpl = _.template($("#apps_tmpl").html());

         this.render = function() {
             elts.$rightColumn.append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$apps.remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

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