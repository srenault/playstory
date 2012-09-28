/**
 * appsView.js
 */

(function(Apps, Router, Bucket) {

    Apps.AppsView = function(server) {
        console.log("[Apps.View] Init Apps view");
        var self = this;

        this.dom = new Apps.AppsDOM();

        this.lazyInit = function() {
            When(Bucket.models('user').onSet)
                .await(this.dom.updateFollowedProjects)
                .subscribe();

            Router.when('dashboard/past/:project', this.dom.refreshNavigation('past'));
            Router.when('dashboard/present/:project', this.dom.refreshNavigation('present'));
            Router.when('dashboard/past/:project/level/:level',this.dom.refreshNavigation('past'));
        };
    };

})(window.PlayStory.Init.Dashboard.Apps,
   window.PlayStory.Router,
   window.PlayStory.Bucket);