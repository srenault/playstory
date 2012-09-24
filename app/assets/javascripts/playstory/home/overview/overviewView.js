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
            Router.from('*paths').when('home', this.dom.renderAsAction);
        };
    };

})(window.PlayStory.Init.Home.Overview,
   window.PlayStory.Router);