/**
 * overviewDOM.js
 */

(function(Overview) {

     Overview.OverviewDOM = function() {
         console.log("[Overview.DOM] Init Overview DOM");
         var self = this;

         var elts = {
             $middleColumn : function() { return $('.column-middle'); },
             $discover : function() { return  $('.overview'); }
         };

         var tmpl = _.template($("#overview_tmpl").html());

         this.render = function() {
             elts.$middleColumn().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$overview().remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

         return this;
     };

 })(window.PlayStory.Init.Home.Overview);