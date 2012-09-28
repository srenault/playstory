/**
 * discoverDOM.js
 */

(function(Discover, DOM) {

     Discover.DiscoverDOM = function() {
         console.log("[Discover.DOM] Init Discover DOM");
         var self = this;

         var elts = {
             $middleColumn : DOM.$elt('.column-middle'),
             $discover : DOM.$elt('.discover'),
             $createProject : DOM.$elt('form[name=create_project] button'),
             $projects : DOM.$elt('.projects')
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

         this.onCreateProjectClick = function(next){
            elts.$createProject().click(preventDefault(next));
         }

         this.displayProjects = Action(function(projects, next) {
             elts.$discover().append(tmplProject({projects: projects.projects}));
             next(projects);
         });

         this.addProject = Action(function(project, next) {
            elts.$projects().prepend("<li>" + project.name + "</li>");
         });

         return this;
     };

 })(window.PlayStory.Init.Home.Discover, window.DOM);
