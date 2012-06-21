/**
 * tabsView.js
 */

(function(Tabs, Router) {

    Tabs.TabsView = function() {
        console.log("[Tabs.View] Init tabs view");
        var self = this;

        //Init
        this.dom = new Tabs.TabsDOM();

        //Routes
        Router.when('past', this.dom.turnOnPastTab);
        Router.when('present', this.dom.turnOnPresentTab);
    };

})(window.PlayStory.Init.Home.Tabs, window.PlayStory.Router);