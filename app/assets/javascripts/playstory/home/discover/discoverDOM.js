/**
 * discoverDOM.js
 */

(function(Discover, DOM) {

     Discover.DiscoverDOM = function() {
         console.log("[Discover.DOM] Init Discover DOM");
         var self = this;

         var elts = {
             $middleColumn : DOM.$elt('.column-middle'),
             $discover : DOM.$elt('.discover')
         };

         var tmpl = _.template($("#discover_tmpl").html());

         this.render = function() {
             elts.$middleColumn().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$discover().remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

         return this;
     };

 })(window.PlayStory.Init.Home.Discover, window.DOM);