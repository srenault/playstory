/**
 * menuDOM.js
 */

(function(Menu, DOM) {

     Menu.MenuDOM = function() {
         console.log("[Menu.DOM] Init Menu DOM");
         var self = this;

         var elts = {
             $leftColumn : DOM.$elt('.column-left'),
             $menu : DOM.$elt('.menu')
         };

         var tmpl = _.template($("#menu_tmpl").html());

         this.render = function() {
             elts.$leftColumn().append(tmpl({
             }));
         };

         this.renderAsAction = asAction(self.render);

         this.destroy = function() {
            elts.$menu().remove();
         };

         this.destroyAsAction = asAction(self.destroy);

         return this;
     };

 })(window.PlayStory.Init.Home.Menu, window.DOM);