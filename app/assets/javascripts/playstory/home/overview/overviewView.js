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
            When(self.dom.onDashboardClick)
                .await(Action(function(evt, next) {
                    evt.preventDefault();
                    Router.go("dashboard", true);
                    next(evt);
                })).subscribe();
        };
    };

})(window.PlayStory.Init.Home.Overview,
   window.PlayStory.Router);