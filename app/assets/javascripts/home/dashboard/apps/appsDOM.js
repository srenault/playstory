/**
 * appsDOM.js
 */

(function(Apps) {

     Apps.AppsDOM = function() {
         console.log("[Inbox.DOM] Init Apps DOM");
         var self = this;

         //DOM elements
         var elts = {
             $rightColumn : function() { return $('.column-right'); },
             $apps : function() { return  $('.apps'); },
             $projects : function() { return $('.apps ul li.project'); }
         };

         var tmpl = _.template($("#apps_tmpl").html());

         this.render = function() {
             elts.$rightColumn().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$apps().remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

         this.refreshNavigation = function(pastOrPresent) {
             return Action(function(any, next) {
                 elts.$projects().find('a').each(function(index, elt) {
                     var project = $(elt).attr('href').split('/')[1],
                         uri = ('#:tabs/:project').replace(':tabs', pastOrPresent)
                                                  .replace(':project', project);
                     $(elt).attr('href', uri);
                 });
                 next(any);
             });
         };
     };

 })(window.PlayStory.Init.Home.Dashboard.Apps);