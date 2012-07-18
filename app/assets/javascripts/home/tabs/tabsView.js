/**
 * tabsView.js
 */

(function(Tabs, Router) {

    Tabs.TabsView = function() {
        console.log("[Tabs.View] Init tabs view");
        var self = this;

        //Init
        this.dom = new Tabs.TabsDOM();

        Router.when('past/:project', this.dom.turnOnPastTab);
        Router.when('present/:project', this.dom.turnOnPresentTab);
        Router.when('past/:project/level/:level', this.dom.turnOnPastTab);

        //Routes
        When(this.dom.onPastTabClick)
        .await(this.dom.turnOnPastTab)
        .subscribe();

        When(this.dom.onPresentTabClick)
        .await(this.dom.turnOnPresentTab)
        .subscribe();
    };

})(window.PlayStory.Init.Home.Tabs, window.PlayStory.Router);