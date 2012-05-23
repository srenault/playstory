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
        Router.put('past', this.dom.turnOnPastTab);
        Router.put('present', this.dom.turnOnPresentTab);
    };

})(window.PlayStory.Init.Home.Tabs, window.PlayStory.Router);