/**
 * layout.js
 */

(function(Dashboard) {

     Dashboard.LayoutDOM = function() {
         console.log("[Dashboard.LayoutDOM] Init layout DOM");
         var self = this;

         //DOM elements
         var elts = {
             $content: function() { return $('.content'); }
         };

         var tmpl = _.template($("#layout_tmpl").html());

         this.render = function() {
             elts.$content().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$content().empty();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });
     };

 })(window.PlayStory.Init.Home.Dashboard);