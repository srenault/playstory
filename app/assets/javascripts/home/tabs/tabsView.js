/**
 * tabsView.js
 */

(function(Tabs) {

    Tabs.TabsView = function() {
        console.log("[Tabs.View] Init tabs view");
        var self = this;

        //Init
        this.dom = new Tabs.TabsDOM();

        //Interactions
        When(this.dom.onPastTabClick)
       .await(this.dom.turnOnPastTab)
       .subscribe();

        When(this.dom.onPresentTabClick)
       .await(this.dom.turnOnPresentTab)
       .subscribe();
    };

})(window.PlayStory.Init.Home.Tabs);