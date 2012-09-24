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
             console.log('render');
             elts.$middleColumn().html(tmpl({
             }));
         };

         this.renderAsAction = asAction(self.render);

         this.destroy = function() {
            elts.$discover().remove();
         };

         this.destroyAsAction = asAction(self.destroy);

         return this;
     };

 })(window.PlayStory.Init.Home.Discover, window.DOM);