/**
 * layout.js
 */

(function(Dashboard) {

    Dashboard.Layout = function() {
         console.log("[Home.Layout] Init layout");
         var self = this;

         var elts = {
             $content: function() { return $('.content'); }
         };

         var tmpl = _.template($("#dashboard_layout_tmpl").html());

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

 })(window.PlayStory.Init.Dashboard);