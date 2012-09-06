/**
 * menuDOM.js
 */

(function(Menu) {

     Menu.MenuDOM = function() {
         console.log("[Menu.DOM] Init Menu DOM");
         var self = this;

         var elts = {
             $leftColumn : function() { return $('.column-left'); },
             $menu : function() { return  $('.menu'); }
         };

         var tmpl = _.template($("#menu_tmpl").html());

         this.render = function() {
             elts.$leftColumn().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$menu().remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

         return this;
     };

 })(window.PlayStory.Init.Home.Menu);