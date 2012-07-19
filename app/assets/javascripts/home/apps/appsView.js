/**
 * appsView.js
 */

(function(Apps, Router) {

    Apps.AppsView = function() {
        console.log("[Apps.View] Init Apps view");
        var self = this;

        //Init
        this.dom = new Apps.AppsDOM();

        Router.when('past/:project', this.dom.refreshNavigation('past'));

        Router.when('present/:project', this.dom.refreshNavigation('present'));

        Router.when('past/:project/level/:level',this.dom.refreshNavigation('past'));
    };

})(window.PlayStory.Init.Home.Apps,
   window.PlayStory.Router);

