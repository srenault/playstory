/**
 * appsView.js
 */

(function(Apps, Router, Bucket) {

    Apps.AppsView = function(server) {
        console.log("[Apps.View] Init Apps view");
        var self = this;

        this.dom = new Apps.AppsDOM();

        Router.when('dashboard/past/:project').chain(
            self.dom.refreshNavigation('past')
        );

        Router.when('dashboard/present/:project').chain(
            self.dom.refreshNavigation('present')
        );

        Router.when('dashboard/past/:project/level/:level').chain(
            self.dom.refreshNavigation('past')
        );

        When(Bucket.models('user').onSet)
            .await(self.dom.renderAsAction)
            .subscribe();

        this.lazyInit = Action(function(any, next) {
            next(any);
        });
    };

})(window.PlayStory.Init.Dashboard.Apps,
   window.PlayStory.Router,
   window.PlayStory.Bucket);