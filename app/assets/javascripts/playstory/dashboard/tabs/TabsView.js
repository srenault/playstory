/**
 * tabsView.js
 */

(function(Tabs, Router) {

    Tabs.TabsView = function() {
        console.log("[Tabs.View] Init tabs view");
        var self = this;

        this.dom = new Tabs.TabsDOM();

        this.lazyInit = function() {
            When(this.dom.onPastTabClick)
                .await(this.dom.turnOnPastTab)
                .subscribe();

            When(this.dom.onPresentTabClick)
                .await(this.dom.turnOnPresentTab)
                .subscribe();

            Router.when('dashboard/past/:project').chain(
                this.dom.turnOnPastTab,
                this.dom.refreshNavigation
            );
            Router.when('dashboard/present/:project').chain(
                this.dom.turnOnPresentTab,
                this.dom.refreshNavigation
            );
            Router.when('dashboard/past/:project/level/:level').chain(
                this.dom.turnOnPastTab,
                this.dom.refreshNavigation
            );
            Router.when('dashboard/past/:project/feed/:id/:limit').chain(
                this.dom.turnOnPastTab,
                this.dom.refreshNavigation
            );
            Router.when('dashboard/past/:project/search/*keywords').chain(
                this.dom.turnOnPastTab,
                this.dom.refreshNavigation
            );
        };

        this.lazyInitAsAction = Action(function(any, next) {
            self.lazyInit();
            next(any);
        });
    };

})(window.PlayStory.Init.Dashboard.Tabs,
   window.PlayStory.Router);