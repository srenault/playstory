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

         var tmpl        = _.template($("#discover_tmpl").html()),
             tmplProject = _.template($("#discover_project_tmpl").html());

         this.render = function() {
             elts.$middleColumn().html(tmpl({
             }));
         };

         this.renderAsAction = asAction(self.render);

         this.destroy = function() {
            elts.$discover().remove();
         };

         this.destroyAsAction = asAction(self.destroy);

         this.displayProjects = Action(function(projects, next) {
             elts.$discover().append(tmplProject({projects: projects.projects}));
             next(projects);
         });

         return this;
     };

 })(window.PlayStory.Init.Home.Discover, window.DOM);
