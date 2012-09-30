/**
 * overviewView.js
 */

(function(Overview, Router) {

    Overview.OverviewView = function(server) {
        console.log("[Overview.View] Init Overview view");
        var self = this;

        this.dom = new Overview.OverviewDOM();

        Router.when('home', server.fetchSummary);
        server.onReceive(server.urls.summary)
              .await(self.dom.drawSummary).subscribe();

        this.lazyInit = Action(function(any, next) {

            When(self.dom.onProjectClick)
            .await(Router.goAsAction("dashboard/past/:project",
                function(uriPattern, project) {
                    return uriPattern.replace(':project', project);
                },
                true
            )).subscribe();

            next(any);
        });
    };

})(window.PlayStory.Init.Home.Overview,
   window.PlayStory.Router);