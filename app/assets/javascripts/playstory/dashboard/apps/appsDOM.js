/**
 * appsDOM.js
 */

(function(Apps, DOM) {

     Apps.AppsDOM = function() {
         console.log("[Inbox.DOM] Init Apps DOM");
         var self = this,
             bucket = PlayStory.Bucket;

         var elts = {
             $rightColumn : DOM.$elt('.column-right'),
             $apps : DOM.$elt('.apps'),
             $projectsContainer : DOM.$elt('.apps ul'),
             $projects : DOM.$elt('.apps ul li.project')
         };

         var tmpl = _.template($("#apps_tmpl").html());

         this.render = function() {
             console.log("[Dashboard] Rendering AppsView");
             elts.$rightColumn().append(tmpl({
             }));
         };

         this.renderAsAction = Action(function(any, next) {
             self.render();
             next(any);
         });

         this.destroy = function() {
            elts.$apps().remove();
         };

         this.destroyAsAction = Action(function(any, next) {
             self.destroy();
             next(any);
         });

         this.updateFollowedProjects = Action(function(any, next) {
             var user = bucket.models('user').get();
             user.projects.forEach(function(project) {
                 elts.$projectsContainer().append(
                     $('<li><a href="#dashboard/past/:project">:project</a></li>'.replace(/:project/g, project))
                 );
             });
             next(any);
         });

         this.refreshNavigation = function(pastOrPresent) {
             return Action(function(any, next) {
                 elts.$projects().find('a').each(function(index, elt) {
                     var project = $(elt).attr('href').split('/')[2],
                         uri = ('#dashboard/:tabs/:project').replace(':tabs', pastOrPresent)
                                                            .replace(':project', project);
                     $(elt).attr('href', uri);
                 });
                 next(any);
             });
         };

         return this;
     };

 })(window.PlayStory.Init.Dashboard.Apps, window.DOM);