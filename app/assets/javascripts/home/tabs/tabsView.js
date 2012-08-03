/**
 * tabsView.js
 */

(function(Tabs, Router) {

    Tabs.TabsView = function() {
        console.log("[Tabs.View] Init tabs view");
        var self = this;

        //Init
        this.dom = new Tabs.TabsDOM();

        Router.when('past/:project').chain(
            this.dom.turnOnPastTab,
            this.dom.refreshNavigation
        );
        Router.when('present/:project').chain(
            this.dom.turnOnPresentTab,
            this.dom.refreshNavigation
        );
        Router.when('past/:project/level/:level').chain(
            this.dom.turnOnPastTab,
            this.dom.refreshNavigation
        );
        Router.when('past/:project/feed/:id/:limit').chain(
            this.dom.turnOnPastTab,
            this.dom.refreshNavigation
        );
        Router.when('past/:project/search/*keywords').chain(
            this.dom.turnOnPastTab,
            this.dom.refreshNavigation
        );

        //Routes
        When(this.dom.onPastTabClick)
        .await(this.dom.turnOnPastTab)
        .subscribe();

        When(this.dom.onPresentTabClick)
        .await(this.dom.turnOnPresentTab)
        .subscribe();
    };

})(window.PlayStory.Init.Home.Tabs, window.PlayStory.Router);