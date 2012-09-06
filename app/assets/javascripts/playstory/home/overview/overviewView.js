/**
 * overviewView.js
 */

(function(Overview, Router) {

    Overview.OverviewView = function(server) {
        console.log("[Overview.View] Init Overview view");
        var self = this;

        //Init
        this.dom = new Overview.OverviewDOM();

        this.lazyInit = function() {
        };
    };

})(window.PlayStory.Init.Home.Overview,
   window.PlayStory.Router);