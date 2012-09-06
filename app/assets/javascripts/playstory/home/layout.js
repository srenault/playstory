/**
 * layout.js
 */

(function(Home) {

     Home.Layout = function() {
         console.log("[Home.LayoutDOM] Init layout DOM");
         var self = this;

         var elts = {
             $content: function() { return $('.content'); }
         };

         var tmpl = _.template($("#home_layout_tmpl").html());

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

 })(window.PlayStory.Init.Home);