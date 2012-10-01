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
             var user = bucket.models('user').get();
             elts.$rightColumn().html(tmpl({
                 projects: (user && user.projects) ? user.projects : []
             }));
         };

         this.renderAsAction = asAction(self.render);

         this.destroy = function() {
            elts.$apps().remove();
         };

         this.destroyAsAction = asAction(self.destroy);

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