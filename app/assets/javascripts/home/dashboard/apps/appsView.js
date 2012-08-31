/**
 * appsView.js
 */

(function(Apps, Router) {

    Apps.AppsView = function() {
        console.log("[Apps.View] Init Apps view");
        var self = this;

        //Init
        this.dom = new Apps.AppsDOM();

        this.lazyInit = function() {
            Router.when('dashboard/past/:project', this.dom.refreshNavigation('past'));
            Router.when('dashboard/present/:project', this.dom.refreshNavigation('present'));
            Router.when('dashboard/past/:project/level/:level',this.dom.refreshNavigation('past'));
        };
    };

})(window.PlayStory.Init.Home.Dashboard.Apps,
   window.PlayStory.Router);