/**
 * tabsView.js
 */

(function(Tabs, Router) {

    Tabs.TabsView = function() {
        console.log("[Tabs.View] Init tabs view");
        var self = this;

        this.dom = new Tabs.TabsDOM();

        this.lazyInit = Action(function(any, next) {
            When(self.dom.onPastTabClick)
                .await(self.dom.turnOnPastTab)
                .subscribe();

            When(self.dom.onPresentTabClick)
                .await(self.dom.turnOnPresentTab)
                .subscribe();

            Router.when('dashboard/past/:project').chain(
                self.dom.turnOnPastTab,
                self.dom.refreshNavigation
            );

            Router.when('dashboard/present/:project').chain(
                self.dom.turnOnPresentTab,
                self.dom.refreshNavigation
            );

            Router.when('dashboard/past/:project/level/:level').chain(
                self.dom.turnOnPastTab,
                self.dom.refreshNavigation
            );

            Router.when('dashboard/past/:project/feed/:id/:limit').chain(
                self.dom.turnOnPastTab,
                self.dom.refreshNavigation
            );

            Router.when('dashboard/past/:project/search/*keywords').chain(
                self.dom.turnOnPastTab,
                self.dom.refreshNavigation
            );

            next(any);
        });
    };

})(window.PlayStory.Init.Dashboard.Tabs,
   window.PlayStory.Router);