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
             elts.$content().addClass("home");
         };

         this.renderAsAction = asAction(self.render);

         this.destroy = function() {
            elts.$content().empty();
            elts.$content().removeClass("home");
         };

         this.destroyAsAction = asAction(self.destroy);
     };

 })(window.PlayStory.Init.Home);