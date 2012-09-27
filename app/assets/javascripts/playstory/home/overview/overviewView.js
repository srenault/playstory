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
            server.onReceive(server.urls.summary)
           .await(this.dom.drawSummary).subscribe();

            Router.from('*paths').when('home').chain(
                this.dom.renderAsAction,
                server.fetchSummary
            );
        };
    };

})(window.PlayStory.Init.Home.Overview,
   window.PlayStory.Router);