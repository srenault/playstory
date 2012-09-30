/**
 * appsView.js
 */

(function(Apps, Router, Bucket) {

    Apps.AppsView = function(server) {
        console.log("[Apps.View] Init Apps view");
        var self = this;

        this.dom = new Apps.AppsDOM();

        this.lazyInit = Action(function(any, next) {
            When(Bucket.models('user').onSet)
                .await(self.dom.updateFollowedProjects)
                .subscribe();

            Router.when('dashboard/past/:project', self.dom.refreshNavigation('past'));
            Router.when('dashboard/present/:project', self.dom.refreshNavigation('present'));
            Router.when('dashboard/past/:project/level/:level',self.dom.refreshNavigation('past'));

            next(any);
        });
    };

})(window.PlayStory.Init.Dashboard.Apps,
   window.PlayStory.Router,
   window.PlayStory.Bucket);